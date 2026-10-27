import json
import re
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class LiveSourceError(RuntimeError):
    """Raised when a public biomedical source cannot be reached or parsed."""


def _get_json(base_url: str, params: dict[str, str]) -> dict:
    request = Request(
        f"{base_url}?{urlencode(params)}",
        headers={"Accept": "application/json", "User-Agent": "ASTROMORPH/1.0 (research interface)"},
    )
    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read())
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise LiveSourceError("A live biomedical data source is unavailable.") from exc


def _get_bytes(base_url: str, params: dict[str, str]) -> bytes:
    request = Request(
        f"{base_url}?{urlencode(params)}",
        headers={"Accept": "application/xml", "User-Agent": "ASTROMORPH/1.0 (research interface)"},
    )
    try:
        with urlopen(request, timeout=20) as response:
            return response.read()
    except (HTTPError, URLError, TimeoutError) as exc:
        raise LiveSourceError("A live biomedical data source is unavailable.") from exc


def search_pubmed(
    query: str = "",
    year_from: str = "",
    journal: str = "",
    limit: int = 25,
) -> tuple[list[dict], int]:
    terms = [query.strip()] if query.strip() else []
    if year_from.isdigit():
        terms.append(f'{year_from}:3000[dp]')
    if journal:
        terms.append(f'"{journal}"[ta]')
    if not terms:
        terms.append(f'"{date.today() - timedelta(days=30):%Y/%m/%d}"[dp] : "{date.today():%Y/%m/%d}"[dp]')
    term = " AND ".join(f"({item})" for item in terms)

    search = _get_json(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
        {"db": "pubmed", "term": term, "retmode": "json", "retmax": str(min(limit, 50)), "sort": "date"},
    )
    result = search.get("esearchresult", {})
    ids = result.get("idlist", [])
    total = int(result.get("count", 0))
    if not ids:
        return [], total

    summary = _get_json(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
        {"db": "pubmed", "id": ",".join(ids), "retmode": "json"},
    ).get("result", {})
    abstracts = ET.fromstring(
        _get_bytes(
            "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
            {"db": "pubmed", "id": ",".join(ids), "retmode": "xml"},
        )
    )
    abstracts_by_id: dict[str, str] = {}
    for article in abstracts.findall(".//PubmedArticle"):
        pmid = article.findtext(".//PMID", default="")
        text = " ".join(
            " ".join(part.itertext()).strip()
            for part in article.findall(".//Abstract/AbstractText")
            if "".join(part.itertext()).strip()
        )
        if pmid:
            abstracts_by_id[pmid] = text

    papers: list[dict] = []
    for pmid in ids:
        item = summary.get(pmid, {})
        pub_types = item.get("pubtype", [])
        if isinstance(pub_types, str):
            pub_types = [pub_types]
        study_type = "; ".join(pub_types) if pub_types else "Not classified by PubMed"
        authors = item.get("authors", [])
        author_names = [a.get("name", "") for a in authors if a.get("name")]
        if len(author_names) > 3:
            author_names = author_names[:3] + ["et al."]
        year_match = re.search(r"\b(19|20)\d{2}\b", item.get("pubdate", ""))
        publication_date = item.get("pubdate", "")
        parsed_date = None
        for date_format in ("%Y %b %d", "%Y %b", "%Y"):
            try:
                parsed_date = datetime.strptime(publication_date, date_format).date()
                break
            except ValueError:
                continue
        papers.append({
            "id": f"pmid-{pmid}",
            "pmid": str(pmid),
            "title": item.get("title", "Title unavailable").rstrip("."),
            "authors": ", ".join(author_names) or "Authors not listed",
            "journal": item.get("fulljournalname") or item.get("source") or "Journal not listed",
            "year": int(year_match.group(0)) if year_match else 0,
            "publicationDate": parsed_date.isoformat() if parsed_date else "",
            "abstractSnippet": abstracts_by_id.get(str(pmid), "Abstract not available in PubMed."),
            "relevanceScore": 0,
            "evidenceLevel": study_type,
            "studyType": study_type,
            "drugIds": [],
            "diseaseIds": [],
        })
    return papers, total


def _phase_name(phases: list[str]) -> str:
    if not phases:
        return "N/A"
    phase = phases[0].replace("PHASE", "Phase ").replace("_", " ").title()
    phase = re.sub(r"Phase (\d)", r"Phase \1", phase)
    return phase if phase in {"Phase 1", "Phase 2", "Phase 3", "Phase 4"} else "N/A"


def search_trials(
    drug: str = "",
    condition: str = "",
    phase: str = "",
    status_filter: str = "",
    country: str = "",
    sponsor: str = "",
    limit: int = 100,
) -> tuple[list[dict], int]:
    params = {
        "format": "json",
        "pageSize": str(min(limit, 100)),
        "countTotal": "true",
        "sort": "LastUpdatePostDate:desc",
    }
    if drug:
        params["query.intr"] = drug
    if condition:
        params["query.cond"] = condition
    if sponsor:
        params["query.spons"] = sponsor
    if status_filter:
        clinical_status = {
            "Active, not recruiting": "ACTIVE_NOT_RECRUITING",
            "Not yet recruiting": "NOT_YET_RECRUITING",
        }.get(status_filter, status_filter.upper().replace(" ", "_"))
        params["filter.overallStatus"] = clinical_status
    data = _get_json("https://clinicaltrials.gov/api/v2/studies", params)
    total = int(data.get("totalCount", 0))
    trials = []
    for record in data.get("studies", []):
        protocol = record.get("protocolSection", {})
        identification = protocol.get("identificationModule", {})
        design = protocol.get("designModule", {})
        status_data = protocol.get("statusModule", {})
        sponsor_data = protocol.get("sponsorCollaboratorsModule", {})
        conditions_data = protocol.get("conditionsModule", {})
        arms = protocol.get("armsInterventionsModule", {})
        outcomes = protocol.get("outcomesModule", {})
        locations_data = protocol.get("contactsLocationsModule", {}).get("locations", [])
        interventions = arms.get("interventions", [])
        locations = [
            {"city": loc.get("city", "Location not listed"), "country": loc.get("country", "Country not listed")}
            for loc in locations_data
        ]
        trial_phase = _phase_name(design.get("phases", []))
        if phase and trial_phase != phase:
            continue
        if country and not any(country.lower() in loc["country"].lower() for loc in locations):
            continue
        nct_id = identification.get("nctId", "")
        status = status_data.get("overallStatus", "UNKNOWN").replace("_", " ").title()
        if status == "Active, Not Recruiting":
            status = "Active, not recruiting"
        if status == "Not Yet Recruiting":
            status = "Not yet recruiting"
        primary_outcomes = outcomes.get("primaryOutcomes", [])
        trials.append({
            "id": nct_id,
            "nctId": nct_id,
            "title": identification.get("briefTitle", "Title unavailable"),
            "drug": ", ".join(i.get("name", "") for i in interventions) or drug or "Not specified",
            "condition": ", ".join(conditions_data.get("conditions", [])) or condition or "Not specified",
            "phase": trial_phase,
            "status": status,
            "sponsor": sponsor_data.get("leadSponsor", {}).get("name", "Sponsor not listed"),
            "startDate": status_data.get("startDateStruct", {}).get("date", ""),
            "lastUpdated": status_data.get("lastUpdatePostDateStruct", {}).get("date", ""),
            "enrollment": design.get("enrollmentInfo", {}).get("count") or 0,
            "locations": locations,
            "summary": protocol.get("descriptionModule", {}).get("briefSummary", "No summary supplied."),
            "primaryOutcome": primary_outcomes[0].get("measure", "Not specified") if primary_outcomes else "Not specified",
        })
    return trials, total


def search_disease(query: str, limit: int = 10) -> tuple[list[dict], int]:
    data = _get_json(
        "https://www.ebi.ac.uk/ols4/api/search",
        {"q": query.strip(), "ontology": "doid", "rows": str(min(limit, 20))},
    )
    docs = data.get("response", {}).get("docs", [])
    matches = []
    for doc in docs:
        description = doc.get("description") or []
        if isinstance(description, str):
            description = [description]
        disease_id = doc.get("obo_id") or doc.get("short_form") or doc.get("iri", "").rsplit("/", 1)[-1]
        matches.append({
            "id": str(disease_id).lower().replace(":", "-"),
            "name": doc.get("label", "Disease term"),
            "icd10": "Not supplied by Disease Ontology",
            "category": "Disease Ontology",
            "prevalence": "Not supplied by this source",
            "mortality": "Not supplied by this source",
            "description": description[0] if description else "No definition supplied by Disease Ontology.",
            "symptoms": [],
            "pathways": [],
            "genes": [],
            "proteinTargets": [],
            "treatments": [],
            "unmetNeed": "Not supplied by this source.",
            "candidates": [],
            "stats": {"trials": 0, "publications": 0, "pathways": 0, "targets": 0},
            "detailed": False,
            "sourceUrl": doc.get("iri", ""),
        })
    return matches, int(data.get("response", {}).get("numFound", len(matches)))


def get_drug_profile(name: str) -> dict | None:
    term = name.strip()
    if not term or len(term) > 160:
        return None
    safe_term = term.replace("\\", "\\\\").replace('"', '\\"')
    params = {
        "search": f'openfda.generic_name:"{safe_term}" OR openfda.brand_name:"{safe_term}"',
        "limit": "1",
    }
    request = Request(
        f"https://api.fda.gov/drug/label.json?{urlencode(params)}",
        headers={"Accept": "application/json", "User-Agent": "ASTROMORPH/1.0 (research interface)"},
    )
    try:
        with urlopen(request, timeout=20) as response:
            result = json.loads(response.read())
    except HTTPError as exc:
        if exc.code == 404:
            return None
        raise LiveSourceError("OpenFDA drug-label data is unavailable.") from exc
    except (URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise LiveSourceError("OpenFDA drug-label data is unavailable.") from exc
    labels = result.get("results", [])
    if not labels:
        return None
    label = labels[0]
    openfda = label.get("openfda", {})

    def field(name: str, fallback: str) -> str:
        value = label.get(name, [])
        return " ".join(v.strip() for v in value if isinstance(v, str) and v.strip()) or fallback

    ingredients = openfda.get("generic_name", [])
    brands = openfda.get("brand_name", [])
    brand = list(dict.fromkeys(brands))
    generic_name = ingredients[0] if ingredients else term
    date_match = re.match(r"\d{4}", label.get("effective_time", ""))
    mechanism = field("mechanism_of_action", "Not reported in this FDA label.")
    indications = field("indications_and_usage", "Not reported in this FDA label.")
    warnings = field("boxed_warning", "")
    classes = openfda.get("pharm_class_epc", []) or openfda.get("pharm_class_moa", [])
    return {
        "id": generic_name.lower().replace(" ", "-"),
        "name": generic_name.title(),
        "brandNames": brand,
        "drugClass": ", ".join(classes) if classes else "Not classified by this FDA label",
        "atcCode": "Not supplied by OpenFDA",
        "approvalYear": int(date_match.group(0)) if date_match else 0,
        "description": field("description", indications),
        "mechanism": mechanism,
        "targets": [],
        "indications": [{"indication": indications, "status": "FDA label"}],
        "pharmacokinetics": [
            {"label": key.replace("_", " ").title(), "value": field(key, "Not reported")}
            for key in ("pharmacokinetics",)
        ],
        "boxedWarning": warnings or None,
        "commonAdverseEvents": [
            {"event": field("adverse_reactions", "Not reported in this FDA label."), "frequency": "See FDA label", "severity": "not-classified"}
        ],
        "contraindications": [field("contraindications", "Not reported in this FDA label.")],
        "repurposingCandidates": [],
        "stats": {"trials": 0, "publications": 0, "pathways": 0, "targets": 0},
        "detailed": False,
        "sourceUrl": f"https://api.fda.gov/drug/label.json?{urlencode(params)}",
        "effectiveDate": label.get("effective_time", ""),
    }
