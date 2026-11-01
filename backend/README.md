# ASTROMORPH FastAPI backend

This starter API verifies Firebase Authentication ID tokens with the Firebase
Admin SDK. Firebase Authentication remains responsible for signing users in;
the backend verifies each bearer token before returning protected data.

## Run locally

1. Create and activate a Python virtual environment in `backend`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and configure Firebase Admin credentials and `GEMINI_API_KEY`.
4. To run the API and frontend together, open a terminal in `frontend` and run
   `npm run dev:all`. This starts FastAPI at `http://localhost:8000` and Vite
   at `http://localhost:5173`; pressing Ctrl+C stops both.

To run only the API from `backend`, use
`python -m uvicorn app.main:app --reload --env-file .env`.

The health check is available at `http://localhost:8000/healthz`, and the
interactive API documentation is at `http://localhost:8000/docs`.

The authenticated `POST /api/analysis/drug-summary` endpoint uses the Gemini
API to generate a research-only drug/condition brief. Keep `GEMINI_API_KEY` in
the backend `.env` only; never expose it through frontend environment variables.
The default model is `gemini-3.6-flash`; override it with `GEMINI_MODEL` only
when the selected model is available for content generation with your API key.
The response is AI-generated and is not a substitute for checking current
primary literature or authoritative prescribing information.
The brief validates its required sections and any cited PMID/NCT identifiers
against retrieved records. If Gemini returns an incomplete answer or is
unavailable, the endpoint displays the matching source records instead and
labels them as evidence, not an AI efficacy assessment.

The authenticated `POST /api/pharmaceutical-intelligence` endpoint accepts
disease, symptom, generic-drug, brand, country, and research-focus fields. It
retrieves product listings and structured labels from openFDA, publications
from PubMed, trial records from ClinicalTrials.gov, and disease terms from the
EBI Disease Ontology. Product listings are not proof of FDA approval. Regulatory
status remains `unknown` unless an authoritative country-specific status has
actually been established; the current integrations do not verify bans or
approval status for India, the UK, or the EU. Gemini synthesis is optional for
this endpoint: source records remain in the response if Gemini is unavailable.
Drug-name suggestions use the openFDA National Drug Code directory; suggestions
are product listings, not proof of approval, and manual entry is also accepted.
When available, the label response includes structured label sections for
mechanism, interactions, warnings, pregnancy/lactation, age groups, organ
impairment, food, and monitoring. These are displayed as sourced label text and
are not a patient-specific assessment.

The pharmaceutical report accepts `currentMedications` (up to 20 names) and
optional `patientRiskFactors`. It lists every supplied medicine pair but marks
the interaction severity `unknown`: this project has no licensed, authoritative
pairwise interaction database configured. It must not be interpreted as a
negative interaction check or evidence of safety. Patient risk factors are
captured but not automatically matched to contraindications. Pair-specific
interaction assessment and personalized contraindication decisions require
review by a pharmacist or clinician.

The report UI and Markdown/PDF output use the requested 13-section research
layout. Regulatory status remains unverified because no official national
restriction or approval search has been integrated; the regulatory authority
links are provided for manual checking and an unknown status is not a claim of
legality, approval, or prohibition. No extra API keys are required for current
public endpoints.

The endpoint returns a `suitability` assessment with the proposed 35/25/15/15/10
component weights, confidence, coverage, record counts, and rationale. The
scoring function is deterministic and independently testable, but the live
retrieval path does not yet systematically appraise study outcomes, mechanism,
or consistency. It therefore returns a null overall score and
`Insufficient evidence to assess` rather than treating search-result volume or
trial registration as evidence of benefit. A numeric score is only produced
when every component has an explicit, cited assessment, and remains a
provisional research categorization, not a clinically validated measure.
Relevant-study counts remain unknown unless relevance is actually verified;
retrieved record counts are shown separately. No diagnosis or treatment advice
is produced from symptoms.

The scoring utility requires a score, rationale, and source URL for all five
components. Confidence remains insufficient if any component is missing or
direct human evidence/agreement has not been assessed. With complete
assessments, high confidence requires agreement, direct human evidence, at
least two cited sources, and evidence-quality, consistency, and human-relevance
scores of at least 80; moderate requires agreement and the quality/relevance
scores of at least 50; conflicting findings cap confidence at low. These are
transparent implementation rules, not expert calibration or clinical
validation.

Run the deterministic backend tests from `backend` with
`python -m unittest discover -s tests -v`. They mock all external services.
Reports generated from the New Analysis brief are saved per signed-in user in
that browser's local storage. They remain available in the Reports tab on that
browser; they are not synchronized to other devices or stored by the backend.
Both saved New Analysis reports and Pharma Safety report downloads follow the
same 13-section research-report order. Where the New Analysis workflow has not
retrieved a safety, interaction, suitability-score, or jurisdictional finding,
the report labels it unassessed instead of filling the section with an
unsupported conclusion.

## Configure Firebase Admin

Use one of the following credential options:

- Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of a Firebase service
  account JSON file.
- Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the service account JSON contents.
- Use Application Default Credentials in the deployment environment.

Optionally set `FIREBASE_PROJECT_ID` and provide the comma-separated browser
origins in `FRONTEND_ORIGINS`. Never commit service-account credentials.

In the Firebase Console, enable Email/Password and Google under
Authentication > Sign-in method. Copy the Firebase Web app's API key, auth
domain, project ID, and app ID into the `VITE_FIREBASE_*` variables in
`frontend/.env`. The frontend will attach the Firebase ID token to API requests
when `VITE_API_BASE_URL` is set.

## Authenticate a request

Sign in through Firebase Authentication in the frontend, then send its Firebase
ID token as `Authorization: Bearer <id-token>`. `GET /api/auth/me` verifies the
signature, expiry, and revocation status and returns the authenticated identity.
Missing or invalid credentials receive HTTP 401; unavailable Firebase
configuration receives HTTP 503.

This starter currently implements `/healthz`, `/api/auth/me`, and
`/api/analysis/drug-summary`; the frontend's other research-data routes have
not yet been ported. Keep
`VITE_API_BASE_URL` empty to continue using the existing frontend mock-data
adapter until those routes are implemented.
