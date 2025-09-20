from app.models.assessment import AssessmentAnswers

# Scoring key for the 48-question Holland Codes (RIASEC) test.
# Each character corresponds to a question and represents one of the six types:
# R: Realistic, I: Investigative, A: Artistic, S: Social, E: Enterprising, C: Conventional.
RIASEC_KEY = "RRRRRRRRIIIIIIIIAAAAAAAASSSSSSSSEEEEEEEECCCCCCCC"

def calculate_riasec_vector(assessment_answers: AssessmentAnswers) -> dict[str, float]:
    """
    Calculates the Holland Code (RIASEC) scores and returns a normalized vector.

    Args:
        assessment_answers: The user's answers from the assessment.

    Returns:
        A dictionary representing the user's RIASEC vector.
    """
    scores = {'R': 0, 'I': 0, 'A': 0, 'S': 0, 'E': 0, 'C': 0}
    # Answers are 0-4: Dislike, Slightly Dislike, Neutral, Slightly Enjoy, Enjoy
    answers = assessment_answers.answers

    for i, answer in enumerate(answers):
        # Count 'Slightly Enjoy' (3) and 'Enjoy' (4) as positive indicators
        if i < len(RIASEC_KEY) and answer >= 3:
            trait = RIASEC_KEY[i]
            if trait in scores:
                # Weight 'Enjoy' more than 'Slightly Enjoy'
                scores[trait] += (answer - 2)  # Maps 3 -> 1, 4 -> 2

    # Normalize scores to create the vector. Max score per trait is 8 * 2 = 16.
    riasec_vector = {trait: score / 16.0 for trait, score in scores.items()}
    return riasec_vector