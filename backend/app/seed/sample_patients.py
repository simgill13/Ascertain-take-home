"""Sample cohort for local development. Every person and address is fictional."""

from dataclasses import dataclass, field
from datetime import date

from app.models import BloodType, PatientStatus


@dataclass(frozen=True)
class SeedNote:
    days_before_reference: int
    content: str


@dataclass(frozen=True)
class SeedPatient:
    first_name: str
    last_name: str
    date_of_birth: date
    phone: str
    address_line1: str
    city: str
    state: str
    postal_code: str
    status: PatientStatus
    email: str | None = None
    address_line2: str | None = None
    blood_type: BloodType | None = None
    allergies: list[str] = field(default_factory=list)
    conditions: list[str] = field(default_factory=list)
    last_visit_days_ago: int | None = None
    notes: list[SeedNote] = field(default_factory=list)


SAMPLE_PATIENTS: list[SeedPatient] = [
    SeedPatient(
        first_name="Maria",
        last_name="Alvarez",
        date_of_birth=date(1968, 3, 14),
        email="maria.alvarez@example.com",
        phone="(503) 555-0142",
        address_line1="1420 SE Hawthorne Blvd",
        address_line2="Apt 3B",
        city="Portland",
        state="OR",
        postal_code="97214",
        blood_type=BloodType.O_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Penicillin"],
        conditions=["Type 2 diabetes", "Hypertension"],
        last_visit_days_ago=12,
        notes=[
            SeedNote(
                12,
                "Follow-up for diabetes. A1c down to 7.1 from 7.8. Continue metformin 1000 mg twice daily. Reinforced carbohydrate counting.",
            ),
            SeedNote(
                102,
                "Blood pressure 142/88 at intake. Increased lisinopril to 20 mg. Patient reports adherence; home readings requested.",
            ),
            SeedNote(
                190, "Annual exam. Foot exam normal, no neuropathy. Referred for retinal screening."
            ),
        ],
    ),
    SeedPatient(
        first_name="James",
        last_name="Okafor",
        date_of_birth=date(1985, 11, 2),
        email="j.okafor@example.com",
        phone="(503) 555-0187",
        address_line1="88 NW 23rd Ave",
        city="Portland",
        state="OR",
        postal_code="97210",
        blood_type=BloodType.A_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=[],
        conditions=["Asthma"],
        last_visit_days_ago=40,
        notes=[
            SeedNote(
                40,
                "Seasonal asthma flare. Peak flow 78% of personal best. Added short course of prednisone; albuterol as needed. Reviewed inhaler technique.",
            ),
            SeedNote(
                300, "Well visit. Asthma well controlled on fluticasone. No ED visits this year."
            ),
        ],
    ),
    SeedPatient(
        first_name="Linh",
        last_name="Nguyen",
        date_of_birth=date(1992, 7, 23),
        email="linh.nguyen@example.com",
        phone="(971) 555-0119",
        address_line1="2701 N Williams Ave",
        city="Portland",
        state="OR",
        postal_code="97227",
        blood_type=BloodType.B_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Latex", "Shellfish"],
        conditions=["Migraine"],
        last_visit_days_ago=5,
        notes=[
            SeedNote(
                5,
                "Migraine frequency increased to 6 days per month. Started topiramate 25 mg nightly, titrate over 4 weeks. Headache diary provided.",
            ),
            SeedNote(
                95,
                "Reports 3 migraines per month responsive to sumatriptan. No aura. Sleep hygiene discussed.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Robert",
        last_name="Castellano",
        date_of_birth=date(1951, 1, 30),
        email=None,
        phone="(503) 555-0163",
        address_line1="5560 SW Beaverton Hillsdale Hwy",
        city="Portland",
        state="OR",
        postal_code="97221",
        blood_type=BloodType.AB_NEGATIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Sulfa drugs", "Aspirin"],
        conditions=["Coronary artery disease", "Hyperlipidemia", "Chronic kidney disease stage 3"],
        last_visit_days_ago=21,
        notes=[
            SeedNote(
                21,
                "Cardiology follow-up reviewed. Stable angina, no change in exertional threshold. eGFR 48, stable. Continue atorvastatin 40 mg and clopidogrel.",
            ),
            SeedNote(
                80,
                "Labs: LDL 68, potassium 4.9. Reinforced low-sodium diet. Daughter accompanies to visits and manages pill organizer.",
            ),
            SeedNote(
                170,
                "Reports occasional ankle swelling in evenings. No orthopnea. Weight stable. Advised leg elevation and to call if swelling worsens.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Priya",
        last_name="Raman",
        date_of_birth=date(1979, 9, 8),
        email="priya.raman@example.com",
        phone="(503) 555-0121",
        address_line1="310 SE Division St",
        city="Portland",
        state="OR",
        postal_code="97202",
        blood_type=BloodType.O_NEGATIVE,
        status=PatientStatus.ACTIVE,
        allergies=[],
        conditions=["Hypothyroidism"],
        last_visit_days_ago=60,
        notes=[
            SeedNote(60, "TSH 2.4 on levothyroxine 75 mcg. Energy improved. Recheck in 12 months."),
        ],
    ),
    SeedPatient(
        first_name="Daniel",
        last_name="Whitfield",
        date_of_birth=date(2001, 4, 17),
        email="dwhitfield@example.com",
        phone="(971) 555-0177",
        address_line1="1932 SE Belmont St",
        city="Portland",
        state="OR",
        postal_code="97214",
        blood_type=BloodType.A_NEGATIVE,
        status=PatientStatus.PENDING,
        allergies=["Peanuts"],
        conditions=[],
        last_visit_days_ago=None,
        notes=[
            SeedNote(
                2,
                "New patient intake scheduled. Transferred records requested from previous clinic. Carries epinephrine auto-injector for peanut allergy.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Grace",
        last_name="Mbeki",
        date_of_birth=date(1960, 12, 5),
        email="grace.mbeki@example.com",
        phone="(503) 555-0199",
        address_line1="7215 N Lombard St",
        city="Portland",
        state="OR",
        postal_code="97203",
        blood_type=BloodType.B_NEGATIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Codeine"],
        conditions=["Osteoarthritis", "Hypertension"],
        last_visit_days_ago=33,
        notes=[
            SeedNote(
                33,
                "Right knee pain limiting walking to two blocks. X-ray shows moderate joint space narrowing. Referred to physical therapy; acetaminophen scheduled.",
            ),
            SeedNote(
                150,
                "Blood pressure controlled at 128/80 on amlodipine. Discussed weight-bearing exercise options.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Ethan",
        last_name="Brooks",
        date_of_birth=date(1996, 6, 11),
        email="ethan.brooks@example.com",
        phone="(503) 555-0108",
        address_line1="4411 NE Fremont St",
        city="Portland",
        state="OR",
        postal_code="97213",
        blood_type=BloodType.O_POSITIVE,
        status=PatientStatus.INACTIVE,
        allergies=[],
        conditions=[],
        last_visit_days_ago=800,
        notes=[
            SeedNote(800, "Sports physical. Cleared for participation. No concerns."),
        ],
    ),
    SeedPatient(
        first_name="Sofia",
        last_name="Petrova",
        date_of_birth=date(1988, 2, 28),
        email="sofia.petrova@example.com",
        phone="(971) 555-0134",
        address_line1="1015 SW Montgomery St",
        address_line2="Unit 12",
        city="Portland",
        state="OR",
        postal_code="97201",
        blood_type=BloodType.AB_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Ibuprofen"],
        conditions=["Generalized anxiety disorder", "GERD"],
        last_visit_days_ago=18,
        notes=[
            SeedNote(
                18,
                "Anxiety improved on sertraline 100 mg; GAD-7 down from 15 to 7. Reflux symptoms controlled with omeprazole; plan to step down in 8 weeks.",
            ),
            SeedNote(
                110,
                "Started sertraline 50 mg. Discussed expected timeline and side effects. Referred to counseling.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Marcus",
        last_name="Lindqvist",
        date_of_birth=date(1973, 8, 19),
        email="marcus.l@example.com",
        phone="(503) 555-0156",
        address_line1="6020 SE Foster Rd",
        city="Portland",
        state="OR",
        postal_code="97206",
        blood_type=BloodType.A_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=[],
        conditions=["Obstructive sleep apnea", "Obesity"],
        last_visit_days_ago=75,
        notes=[
            SeedNote(
                75,
                "CPAP compliance 6.2 hours per night per device download. Daytime sleepiness resolved. Weight down 9 lb since last visit.",
            ),
            SeedNote(
                260,
                "Sleep study confirmed moderate OSA, AHI 22. CPAP ordered. Discussed weight management plan.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Aisha",
        last_name="Rahman",
        date_of_birth=date(1994, 10, 3),
        email="aisha.rahman@example.com",
        phone="(971) 555-0188",
        address_line1="2200 NE Alberta St",
        city="Portland",
        state="OR",
        postal_code="97211",
        blood_type=BloodType.B_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Amoxicillin"],
        conditions=["Iron deficiency anemia"],
        last_visit_days_ago=9,
        notes=[
            SeedNote(
                9,
                "Hemoglobin 11.8, up from 10.2. Ferritin improving on oral iron. Continue 3 more months then recheck.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Henry",
        last_name="Caldwell",
        date_of_birth=date(1946, 5, 22),
        email=None,
        phone="(503) 555-0113",
        address_line1="3350 SE Powell Blvd",
        city="Portland",
        state="OR",
        postal_code="97202",
        blood_type=BloodType.O_NEGATIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Contrast dye"],
        conditions=[
            "Atrial fibrillation",
            "Heart failure with preserved ejection fraction",
            "COPD",
        ],
        last_visit_days_ago=7,
        notes=[
            SeedNote(
                7,
                "Weight up 4 lb in one week with increased dyspnea. Furosemide increased to 40 mg daily for 5 days. Daily weights reviewed; call if gain exceeds 2 lb overnight.",
            ),
            SeedNote(
                45,
                "INR 2.6, in range. Rate controlled on metoprolol. Spirometry stable. Reviewed inhaler technique and flu vaccine given.",
            ),
            SeedNote(
                130,
                "Hospital discharge follow-up after COPD exacerbation. Completed steroid taper. Pulmonary rehab referral placed.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Isabella",
        last_name="Moreau",
        date_of_birth=date(1983, 12, 14),
        email="isabella.moreau@example.com",
        phone="(503) 555-0171",
        address_line1="912 NW Everett St",
        city="Portland",
        state="OR",
        postal_code="97209",
        blood_type=BloodType.A_NEGATIVE,
        status=PatientStatus.ACTIVE,
        allergies=[],
        conditions=["Rheumatoid arthritis"],
        last_visit_days_ago=50,
        notes=[
            SeedNote(
                50,
                "Morning stiffness under 30 minutes on methotrexate 15 mg weekly with folic acid. CBC and LFTs normal. Continue current regimen.",
            ),
            SeedNote(
                140,
                "Flare in bilateral hands. Prednisone bridge 10 mg for 2 weeks. Rheumatology aware.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Tomas",
        last_name="Kowalczyk",
        date_of_birth=date(1999, 3, 9),
        email="tomas.k@example.com",
        phone="(971) 555-0145",
        address_line1="1750 SE 82nd Ave",
        city="Portland",
        state="OR",
        postal_code="97216",
        blood_type=None,
        status=PatientStatus.PENDING,
        allergies=[],
        conditions=[],
        last_visit_days_ago=None,
        notes=[],
    ),
    SeedPatient(
        first_name="Evelyn",
        last_name="Hart",
        date_of_birth=date(1938, 7, 1),
        email=None,
        phone="(503) 555-0126",
        address_line1="4805 SW Macadam Ave",
        address_line2="Room 214",
        city="Portland",
        state="OR",
        postal_code="97239",
        blood_type=BloodType.B_NEGATIVE,
        status=PatientStatus.DISCHARGED,
        allergies=["Morphine"],
        conditions=["Dementia", "Osteoporosis"],
        last_visit_days_ago=400,
        notes=[
            SeedNote(
                400,
                "Transferred care to memory care facility physician. Records sent. Family informed of transition.",
            ),
            SeedNote(
                470,
                "Fall at home without fracture. DEXA T-score -2.8. Started alendronate; home safety evaluation ordered.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Noah",
        last_name="Fitzgerald",
        date_of_birth=date(2010, 9, 27),
        email="fitzgerald.family@example.com",
        phone="(503) 555-0192",
        address_line1="2630 NE Sandy Blvd",
        city="Portland",
        state="OR",
        postal_code="97232",
        blood_type=BloodType.O_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Eggs"],
        conditions=["Attention deficit hyperactivity disorder"],
        last_visit_days_ago=28,
        notes=[
            SeedNote(
                28,
                "Medication check. Methylphenidate ER 27 mg effective through school day; appetite reduced but weight tracking on curve. Parent and teacher Vanderbilt forms improved.",
            ),
            SeedNote(
                210,
                "Annual well-child visit. Growth at 45th percentile. Vaccines up to date except egg-allergy-safe flu vaccine, given today.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Chloe",
        last_name="Bennett",
        date_of_birth=date(1990, 1, 15),
        email="chloe.bennett@example.com",
        phone="(971) 555-0102",
        address_line1="3121 SE Milwaukie Ave",
        city="Portland",
        state="OR",
        postal_code="97202",
        blood_type=BloodType.AB_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=[],
        conditions=["Polycystic ovary syndrome"],
        last_visit_days_ago=85,
        notes=[
            SeedNote(
                85,
                "Cycles regular on combined oral contraceptive. Fasting glucose normal. Discussed long-term metabolic monitoring.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Samuel",
        last_name="Adeyemi",
        date_of_birth=date(1957, 6, 6),
        email="s.adeyemi@example.com",
        phone="(503) 555-0139",
        address_line1="9000 SW Barbur Blvd",
        city="Portland",
        state="OR",
        postal_code="97219",
        blood_type=BloodType.A_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=["Statins"],
        conditions=["Type 2 diabetes", "Hyperlipidemia", "Benign prostatic hyperplasia"],
        last_visit_days_ago=15,
        notes=[
            SeedNote(
                15,
                "Statin intolerance (myalgia). Started ezetimibe 10 mg. A1c 6.9. Tamsulosin relieving nocturia to once nightly.",
            ),
            SeedNote(
                120,
                "Diabetes stable on metformin. Discussed PSA screening; patient elected to continue annual testing.",
            ),
        ],
    ),
    SeedPatient(
        first_name="Hannah",
        last_name="Schreiber",
        date_of_birth=date(1976, 4, 2),
        email="hannah.schreiber@example.com",
        phone="(971) 555-0164",
        address_line1="1234 SE Stark St",
        city="Portland",
        state="OR",
        postal_code="97214",
        blood_type=BloodType.O_NEGATIVE,
        status=PatientStatus.INACTIVE,
        allergies=["Nickel"],
        conditions=["Seasonal allergic rhinitis"],
        last_visit_days_ago=600,
        notes=[
            SeedNote(
                600,
                "Allergic rhinitis controlled with intranasal fluticasone and cetirizine during spring. No other concerns.",
            ),
        ],
    ),
    SeedPatient(
        first_name="William",
        last_name="Tanaka",
        date_of_birth=date(1965, 10, 20),
        email="william.tanaka@example.com",
        phone="(503) 555-0150",
        address_line1="7700 NE Glisan St",
        city="Portland",
        state="OR",
        postal_code="97213",
        blood_type=BloodType.B_POSITIVE,
        status=PatientStatus.ACTIVE,
        allergies=[],
        conditions=["Gout", "Hypertension"],
        last_visit_days_ago=3,
        notes=[
            SeedNote(
                3,
                "Acute gout flare in left first MTP joint. Colchicine started; uric acid 8.9. Will begin allopurinol after flare resolves.",
            ),
            SeedNote(
                200,
                "Blood pressure 134/84 on losartan. Second flare this year; discussed urate-lowering therapy and limiting alcohol.",
            ),
        ],
    ),
]
