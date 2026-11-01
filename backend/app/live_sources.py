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
            result = json.loads(response.read())
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise LiveSourceError("A live biomedical data source is unavailable.") from exc
    if not isinstance(result, dict):
        raise LiveSourceError("A live biomedical data source returned an unexpected response.")
    return result


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
    if not isinstance(result, dict):
        raise LiveSourceError("PubMed returned an unexpected search response.")
    ids = result.get("idlist", [])
    if not isinstance(ids, list) or not all(isinstance(pmid, str) for pmid in ids):
        raise LiveSourceError("PubMed returned an unexpected search response.")
    try:
        total = int(result.get("count", 0))
    except (TypeError, ValueError) as exc:
        raise LiveSourceError("PubMed returned an unexpected result count.") from exc
    if not ids:
        return [], total

    summary = _get_json(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
        {"db": "pubmed", "id": ",".join(ids), "retmode": "json"},
    ).get("result", {})
    if not isinstance(summary, dict):
        raise LiveSourceError("PubMed returned an unexpected summary response.")
    try:
        abstracts = ET.fromstring(
            _get_bytes(
                "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
                {"db": "pubmed", "id": ",".join(ids), "retmode": "xml"},
            )
        )
    except ET.ParseError as exc:
        raise LiveSourceError("PubMed returned malformed article data.") from exc
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
        if not isinstance(item, dict):
            continue
        pub_types = item.get("pubtype", [])
        if isinstance(pub_types, str):
            pub_types = [pub_types]
        if not isinstance(pub_types, list):
            pub_types = []
        pub_types = [value for value in pub_types if isinstance(value, str)]
        study_type = "; ".join(pub_types) if pub_types else "Not classified by PubMed"
        authors = item.get("authors", [])
        if not isinstance(authors, list):
            authors = []
        author_names = [
            author["name"]
            for author in authors
            if isinstance(author, dict) and isinstance(author.get("name"), str) and author["name"]
        ]
        if len(author_names) > 3:
            author_names = author_names[:3] + ["et al."]
        publication_date = item.get("pubdate") if isinstance(item.get("pubdate"), str) else ""
        year_match = re.search(r"\b(19|20)\d{2}\b", publication_date)
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
            "title": (item.get("title") if isinstance(item.get("title"), str) else "Title unavailable").rstrip("."),
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
    raw_studies = data.get("studies", [])
    if not isinstance(raw_studies, list):
        raise LiveSourceError("ClinicalTrials.gov returned an unexpected study list.")
    try:
        total = int(data.get("totalCount", 0))
    except (TypeError, ValueError) as exc:
        raise LiveSourceError("ClinicalTrials.gov returned an unexpected result count.") from exc
    trials = []
    for record in raw_studies:
        if not isinstance(record, dict):
            continue
        protocol = record.get("protocolSection", {})
        if not isinstance(protocol, dict):
            continue
        identification = protocol.get("identificationModule", {})
        design = protocol.get("designModule", {})
        status_data = protocol.get("statusModule", {})
        sponsor_data = protocol.get("sponsorCollaboratorsModule", {})
        conditions_data = protocol.get("conditionsModule", {})
        arms = protocol.get("armsInterventionsModule", {})
        outcomes = protocol.get("outcomesModule", {})
        if not isinstance(identification, dict):
            identification = {}
        if not isinstance(design, dict):
            design = {}
        if not isinstance(status_data, dict):
            status_data = {}
        if not isinstance(sponsor_data, dict):
            sponsor_data = {}
        if not isinstance(conditions_data, dict):
            conditions_data = {}
        if not isinstance(arms, dict):
            arms = {}
        if not isinstance(outcomes, dict):
            outcomes = {}
        location_module = protocol.get("contactsLocationsModule", {})
        if not isinstance(location_module, dict):
            location_module = {}
        locations_data = location_module.get("locations", [])
        if not isinstance(locations_data, list):
            locations_data = []
        interventions = arms.get("interventions", [])
        if not isinstance(interventions, list):
            interventions = []
        locations = [
            {
                "city": loc.get("city", "Location not listed"),
                "country": loc.get("country", "Country not listed"),
            }
            for loc in locations_data
            if isinstance(loc, dict)
        ]
        phases = design.get("phases", [])
        trial_phase = _phase_name([phase for phase in phases if isinstance(phase, str)] if isinstance(phases, list) else [])
        if phase and trial_phase != phase:
            continue
        if country and not any(country.lower() in loc["country"].lower() for loc in locations):
            continue
        nct_id = identification.get("nctId", "")
        raw_status = status_data.get("overallStatus")
        status = (raw_status if isinstance(raw_status, str) else "UNKNOWN").replace("_", " ").title()
        if status == "Active, Not Recruiting":
            status = "Active, not recruiting"
        if status == "Not Yet Recruiting":
            status = "Not yet recruiting"
        primary_outcomes = outcomes.get("primaryOutcomes", [])
        if not isinstance(primary_outcomes, list):
            primary_outcomes = []
        conditions = conditions_data.get("conditions", [])
        if not isinstance(conditions, list):
            conditions = []
        interventions = [intervention for intervention in interventions if isinstance(intervention, dict)]
        lead_sponsor = sponsor_data.get("leadSponsor", {})
        if not isinstance(lead_sponsor, dict):
            lead_sponsor = {}
        enrollment = design.get("enrollmentInfo", {})
        if not isinstance(enrollment, dict):
            enrollment = {}
        description = protocol.get("descriptionModule", {})
        if not isinstance(description, dict):
            description = {}
        last_updated = status_data.get("lastUpdatePostDateStruct", {})
        if not isinstance(last_updated, dict):
            last_updated = {}
        start_date = status_data.get("startDateStruct", {})
        if not isinstance(start_date, dict):
            start_date = {}
        trials.append({
            "id": nct_id,
            "nctId": nct_id,
            "title": identification.get("briefTitle", "Title unavailable"),
            "drug": ", ".join(i.get("name", "") for i in interventions) or drug or "Not specified",
            "condition": ", ".join(value for value in conditions if isinstance(value, str)) or condition or "Not specified",
            "phase": trial_phase,
            "status": status,
            "sponsor": lead_sponsor.get("name", "Sponsor not listed"),
            "startDate": start_date.get("date", ""),
            "lastUpdated": last_updated.get("date", ""),
            "enrollment": enrollment.get("count") or 0,
            "locations": locations,
            "summary": description.get("briefSummary", "No summary supplied."),
            "primaryOutcome": primary_outcomes[0].get("measure", "Not specified") if primary_outcomes and isinstance(primary_outcomes[0], dict) else "Not specified",
        })
    return trials, total


def search_disease(query: str, limit: int = 10) -> tuple[list[dict], int]:
    data = _get_json(
        "https://www.ebi.ac.uk/ols4/api/search",
        {"q": query.strip(), "ontology": "doid", "rows": str(min(limit, 20))},
    )
    response = data.get("response")
    if not isinstance(response, dict) or not isinstance(response.get("docs"), list):
        raise LiveSourceError("Disease Ontology returned an unexpected response.")
    docs = response["docs"]
    matches = []
    for doc in docs:
        if not isinstance(doc, dict):
            continue
        description = doc.get("description") or []
        if isinstance(description, str):
            description = [description]
        if not isinstance(description, list):
            description = []
        description = [item for item in description if isinstance(item, str)]
        disease_id = doc.get("obo_id") or doc.get("short_form") or doc.get("iri", "").rsplit("/", 1)[-1]
        label = doc.get("label") if isinstance(doc.get("label"), str) else "Disease term"
        iri = doc.get("iri") if isinstance(doc.get("iri"), str) else ""
        matches.append({
            "id": str(disease_id).lower().replace(":", "-"),
            "name": label,
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
            "sourceUrl": iri,
        })
    try:
        total = int(response.get("numFound", len(matches)))
    except (TypeError, ValueError) as exc:
        raise LiveSourceError("Disease Ontology returned an unexpected result count.") from exc
    return matches, total


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
    if not isinstance(result, dict):
        raise LiveSourceError("OpenFDA drug-label data returned an unexpected response.")
    labels = result.get("results", [])
    if not isinstance(labels, list):
        raise LiveSourceError("OpenFDA drug-label data returned an unexpected label list.")
    if not labels:
        return None
    label = labels[0]
    if not isinstance(label, dict):
        raise LiveSourceError("OpenFDA drug-label data returned an unexpected label.")
    openfda = label.get("openfda", {})
    if not isinstance(openfda, dict):
        raise LiveSourceError("OpenFDA drug-label data returned an unexpected product identity.")

    def field(name: str, fallback: str) -> str:
        value = label.get(name, [])
        if isinstance(value, str):
            value = [value]
        if not isinstance(value, list):
            return fallback
        return " ".join(v.strip() for v in value if isinstance(v, str) and v.strip()) or fallback

    ingredients = openfda.get("generic_name", [])
    brands = openfda.get("brand_name", [])
    ingredients = [item for item in ingredients if isinstance(item, str)] if isinstance(ingredients, list) else []
    brands = [item for item in brands if isinstance(item, str)] if isinstance(brands, list) else []
    brand = list(dict.fromkeys(brands))
    generic_name = ingredients[0] if ingredients else term
    effective_time = label.get("effective_time")
    effective_time = effective_time if isinstance(effective_time, str) else ""
    date_match = re.match(r"\d{4}", effective_time)
    mechanism = field("mechanism_of_action", "")
    indications = field("indications_and_usage", "")
    warnings = field("boxed_warning", "")
    label_sections = {
        key: value
        for key in (
            "mechanism_of_action",
            "warnings_and_cautions",
            "drug_interactions",
            "use_in_specific_populations",
            "pregnancy",
            "lactation",
            "pediatric_use",
            "geriatric_use",
            "renal_impairment",
            "hepatic_impairment",
            "food_effect",
            "alcohol",
            "laboratory_tests",
            "dosage_forms_and_strengths",
            "patient_counseling_information",
        )
        if (value := field(key, ""))
    }
    classes = openfda.get("pharm_class_epc", []) or openfda.get("pharm_class_moa", [])
    classes = [item for item in classes if isinstance(item, str)] if isinstance(classes, list) else []
    return {
        "id": generic_name.lower().replace(" ", "-"),
        "name": generic_name.title(),
        "genericNameVerified": bool(ingredients),
        "brandNames": brand,
        "drugClass": ", ".join(classes) if classes else "Not classified by this FDA label",
        "atcCode": "Not supplied by OpenFDA",
        "approvalYear": int(date_match.group(0)) if date_match else 0,
        "description": field("description", indications),
        "mechanism": mechanism or "Not reported in this FDA label.",
        "labelSections": label_sections,
        "targets": [],
        "indications": [{"indication": indications, "status": "FDA label"}] if indications else [],
        "pharmacokinetics": [
            {"label": key.replace("_", " ").title(), "value": field(key, "Not reported")}
            for key in ("pharmacokinetics",)
        ],
        "boxedWarning": warnings or None,
        "commonAdverseEvents": (
            [{"event": field("adverse_reactions", ""), "frequency": "See FDA label", "severity": "not-classified"}]
            if field("adverse_reactions", "") else []
        ),
        "contraindications": [field("contraindications", "")] if field("contraindications", "") else [],
        "repurposingCandidates": [],
        "stats": {"trials": 0, "publications": 0, "pathways": 0, "targets": 0},
        "detailed": False,
        "sourceUrl": f"https://api.fda.gov/drug/label.json?{urlencode(params)}",
        "effectiveDate": effective_time,
    }


def search_fda_products(name: str, limit: int = 5, *, prefix: bool = False) -> tuple[list[dict], str]:
    term = name.strip()
    if not term or len(term) > 160:
        return [], ""
    safe_term = term.replace("\\", "\\\\").replace('"', '\\"')
    term_query = f'"{safe_term}"*' if prefix else f'"{safe_term}"'
    params = {
        "search": f"brand_name:{term_query} OR generic_name:{term_query}",
        "limit": str(min(max(limit, 1), 10)),
    }
    source_url = f"https://api.fda.gov/drug/ndc.json?{urlencode(params)}"
    request = Request(
        source_url,
        headers={"Accept": "application/json", "User-Agent": "ASTROMORPH/1.0 (research interface)"},
    )
    try:
        with urlopen(request, timeout=20) as response:
            result = json.loads(response.read())
    except HTTPError as exc:
        if exc.code == 404:
            return [], source_url
        raise LiveSourceError("FDA product-listing data is unavailable.") from exc
    except (URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise LiveSourceError("FDA product-listing data is unavailable.") from exc

    records = result.get("results") if isinstance(result, dict) else None
    if not isinstance(records, list):
        raise LiveSourceError("FDA product-listing data returned an unexpected response.")

    products = []
    seen = set()
    for record in records:
        if not isinstance(record, dict):
            continue
        product_ndc = record.get("product_ndc")
        if not isinstance(product_ndc, str) or not product_ndc or product_ndc in seen:
            continue
        seen.add(product_ndc)
        raw_ingredients = record.get("active_ingredients", [])
        ingredients = []
        if isinstance(raw_ingredients, list):
            ingredients = [
                {
                    "name": item["name"],
                    "strength": item.get("strength") if isinstance(item.get("strength"), str) else None,
                }
                for item in raw_ingredients
                if isinstance(item, dict) and isinstance(item.get("name"), str)
            ]
        products.append({
            "productNdc": product_ndc,
            "brandName": record.get("brand_name") if isinstance(record.get("brand_name"), str) else None,
            "genericName": record.get("generic_name") if isinstance(record.get("generic_name"), str) else None,
            "dosageForm": record.get("dosage_form") if isinstance(record.get("dosage_form"), str) else None,
            "activeIngredients": ingredients,
            "manufacturer": record.get("labeler_name") if isinstance(record.get("labeler_name"), str) else None,
            "marketingStartDate": record.get("marketing_start_date") if isinstance(record.get("marketing_start_date"), str) else None,
            "marketingEndDate": record.get("marketing_end_date") if isinstance(record.get("marketing_end_date"), str) else None,
            "listingExpirationDate": record.get("listing_expiration_date") if isinstance(record.get("listing_expiration_date"), str) else None,
            "marketingCategory": record.get("marketing_category") if isinstance(record.get("marketing_category"), str) else None,
        })
    return products, source_url
