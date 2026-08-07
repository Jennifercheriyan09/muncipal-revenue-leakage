# English Voice Complaint Testing — QA Report

**Prepared by:** Jennifer  
**Test scope:** 75 complaints submitted via voice note in English  
**Objective:** Evaluate how the AI voice-complaint pipeline (transcription → ward detection → category detection → priority detection → officer dashboard routing) performs specifically on English-language input.

---

## 1. Summary

| Metric | Result | Rate |
|---|---:|---:|
| Total complaints tested | 75 | — |
| Transcript successfully generated | 68 / 75 | ~91% |
| Transcript accuracy (of generated) | 68 / 68 scored 5/5 | 100% |
| Category correctly detected | 69 / 69 applicable | 100% |
| Ward correctly detected | 58 / 70 applicable* | ~83% |
| Ward incorrect | 12 / 70 | ~17% |
| Overall Pass | 61 / 75 | ~81% |
| Overall Fail | 12 / 75 | ~16% |
| Not applicable / rejected as out-of-scope | 1 / 75 | — |

\*Includes one row where "yes" was entered in lowercase and treated as a successful ward mapping.

**Headline:** The English pipeline demonstrates **excellent transcription quality and category classification**, with every successfully generated transcript receiving a perfect accuracy score and all applicable complaints being categorized correctly. Similar to the Urdu testing, the largest source of failures is **ward detection**, while priority assignment shows a tendency to overestimate or underestimate severity in several edge cases.

---

## 2. Pipeline Stage Breakdown

### 2.1 Transcription

- 68 of 75 voice complaints were transcribed successfully.
- Three complaints failed because the **voice recording exceeded the 1-minute recording limit** (Test IDs **2, 11, 15**).
- Two additional test rows did not generate transcripts because they represented special cases (ward-mapping/vaccination scenarios).
- Every generated transcript received a **5/5 transcription accuracy score**.
- Minor pronunciation or locality spelling differences (e.g. *Dhavan Vasti → Tavan Vasti*, *Adarsh Siddhi Colony → Siddhi Colony*) generally did not affect transcription quality itself but occasionally contributed to incorrect ward mapping.

**Takeaway:** English speech-to-text performance is highly reliable. The primary limitation is the recording-duration restriction rather than transcription quality.

---

### 2.2 Category Detection

- Category detection achieved **100% accuracy** across all applicable complaints.
- Civic issues including water supply, sanitation, road infrastructure, tax/payment issues, mosquito complaints and general civic complaints were consistently classified into the correct categories.
- One vaccination-related complaint (Test ID **21**) was correctly treated as outside the supported complaint scope.

**Takeaway:** Category classification is production-ready and was not responsible for any meaningful failures during testing.

---

### 2.3 Ward Detection — Primary Failure Area

Ward mapping remains the largest contributor to failed tests.

Out of the applicable complaints:

- **58 correctly mapped**
- **12 incorrectly mapped**

Recurring failure patterns observed:

| Pattern | Example(s) | Description |
|---|---|---|
| Incorrect locality mapping | Test IDs 12, 39, 49 | Correct location identified in speech but mapped to the wrong ward. |
| Transcription altered locality name | Test IDs 18, 24 | Slight locality transcription differences resulted in incorrect ward assignment. |
| Geographic keyword confusion | Test ID 65 | "Water pipeline" was interpreted as **Pipeline Road**, causing an incorrect ward. |
| Multiple locations mentioned | Test IDs 66, 70, 74, 75 | When multiple place names appeared in the complaint, the system prioritized the wrong locality. |
| No location provided | Test ID 72 | No address was mentioned, yet the system still assigned a ward instead of flagging it as unresolved. |
| Similar locality confusion | Test ID 71 | "Juna Bazaar" was interpreted as "Anandi Bazaar", resulting in incorrect mapping. |

**Takeaway:** Ward detection is clearly the weakest stage in the pipeline. The English tests reveal the same issues observed in other languages:

- The system should avoid assigning a ward when no location is mentioned.
- Confidence scoring should be introduced before fuzzy-matching locality names.
- Better handling is needed when multiple addresses or landmarks appear in the same complaint.
- Geographic keywords that are not addresses (such as "water pipeline") should not automatically trigger location matching.

---

### 2.4 Priority Detection

Priority assignment generally worked well but several edge cases were observed.

Common patterns included:

- Water supply complaints lasting several days or affecting multiple households were often classified as **Medium** instead of **High/Critical**.
- Some complaints involving accidents, mosquito infestation or encroachment were assigned **Critical** where **Medium** or **High** appeared more appropriate.
- Utility and billing complaints occasionally received **Low** priority despite potentially immediate payment deadlines.
- Multiple notes throughout the testing indicate a tendency to both **overestimate** and **underestimate** severity depending on complaint wording.

Examples include:

- Test ID 3 – Critical instead of Medium.
- Test ID 5 – Accident reference resulted in Critical instead of Medium.
- Test IDs 13, 19, 25, 29, 43, 61 – Long-term water supply issues deserved higher priority.
- Test ID 8 – Bill-related complaint should likely have been High/Critical instead of Low.
- Test ID 50 – Mosquito infestation may have been better classified as High than Critical.

**Takeaway:** Priority detection is generally usable but would benefit from improved severity calibration, especially for prolonged water outages, billing urgency and complaints containing contextual keywords that currently inflate severity.

---

## 3. Full List of Failed Cases

| Test ID | Ward Correct? | Category Correct? | Result | Notes |
|---|---|---|---|---|
| 2 | N/A | N/A | Pass* | Voice exceeded 1-minute recording limit |
| 11 | N/A | N/A | Pass* | Voice exceeded 1-minute recording limit |
| 12 | No | Yes | Fail | Saras Nagar (Ward 14) mapped to Ward 3 |
| 14 | No | Yes | Fail | Incorrectly mapped near Narendra Medical, Joshi Hospital |
| 15 | N/A | N/A | Pass* | Voice exceeded 1-minute recording limit |
| 18 | No | Yes | Fail | Adarsh Siddhi Colony transcribed incorrectly, resulting in wrong ward |
| 21 | N/A | N/A | Fail | Vaccination complaint correctly rejected as out-of-scope |
| 39 | No | Yes | Fail | Incorrect ward due to address mapping |
| 49 | No | Yes | Fail | Ward incorrectly mapped |
| 65 | No | Yes | Fail | "Water pipeline" interpreted as Pipeline Road |
| 66 | No | Yes | Fail | Multiple locations caused incorrect ward selection |
| 70 | No | Yes | Fail | Multiple locations mentioned; wrong ward selected and priority could be higher |
| 71 | No | Yes | Fail | "Juna Bazaar" confused with "Anandi Bazaar" |
| 72 | Yes* | Yes | Observation | No address mentioned, yet Ward 11 assigned |
| 74 | No | Yes | Fail | Savedi prioritized instead of Raosaheb Patwardhan Smarak (Ward 5) |
| 75 | No | Yes | Fail | Savedi prioritized instead of Chaitanyanagar (Ward 4) |

\*Voice-length failures are expected system behaviour rather than language-processing failures.

---

## 4. Recommendations

1. **Improve ward-detection confidence handling**
   - Do not assign a ward when no location is present.
   - Introduce confidence thresholds before fuzzy matching locality names.
   - Improve handling of complaints mentioning multiple locations.
   - Distinguish infrastructure terms (e.g. "water pipeline") from actual addresses.

2. **Refine priority detection**
   - Increase severity for prolonged water outages and large-scale service disruptions.
   - Reduce unnecessary Critical assignments caused by isolated keywords.
   - Better distinguish billing urgency from routine payment complaints.

3. **Review transcription-to-location dependency**
   - Minor transcription variations in locality names should not immediately result in different ward assignments.
   - Introduce alias dictionaries or phonetic normalization for commonly misheard localities.

4. **Continue validating voice-duration limits**
   - Several otherwise valid complaints exceeded the 1-minute limit.
   - Consider whether longer recordings should be supported for detailed complaints.

5. **Normalize QA sheet values**
   - Standardize values such as "Passed"/"passed", "Yes"/"yes", and missing entries to simplify future reporting and metric generation.

---

## 5. Conclusion

The English voice-complaint pipeline performs **very strongly in transcription and category classification**, both of which achieved excellent results throughout testing. The primary opportunity for improvement remains **ward detection**, particularly when complaints contain multiple locations, ambiguous locality names or no location at all. Priority assignment is generally effective but would benefit from better severity calibration for water-supply, billing and infrastructure-related complaints. Addressing ward-detection logic would significantly improve the overall reliability of the English pipeline.