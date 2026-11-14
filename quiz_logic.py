"""Pure quiz rules for AquaMath.

This file has no Streamlit code, so the scoring and adaptive-difficulty rules
are easy to explain and test.
"""

DIFFICULTIES = ("easy", "medium", "hard")
POINT_MULTIPLIERS = {"easy": 1, "medium": 1.5, "hard": 2}
STARTING_TIMES = {"easy": 35, "medium": 30, "hard": 26}


def time_limit(difficulty: str, question_number: int) -> int:
    """Return the seconds available; later questions get three seconds less."""
    return max(12, STARTING_TIMES[difficulty] - question_number * 3)


def next_difficulty(current: str, correct: bool, fast: bool) -> str:
    """Move up for a fast correct answer and down for an incorrect answer."""
    position = DIFFICULTIES.index(current)
    if correct and fast:
        position = min(position + 1, len(DIFFICULTIES) - 1)
    elif not correct:
        position = max(position - 1, 0)
    return DIFFICULTIES[position]


def normalize_answer(value: str) -> str:
    """Make equivalent answers such as '600 ml' and '600mL' compare equally."""
    cleaned = value.lower().replace(",", "").replace(" ", "")
    cleaned = cleaned.replace("milliliters", "ml").replace("millilitres", "ml")
    cleaned = cleaned.replace("liters", "l").replace("litres", "l")
    return cleaned


def is_correct(question: dict, answer) -> bool:
    """Grade either a multiple-choice index or a typed short answer."""
    if question["type"] == "short":
        normalized = normalize_answer(str(answer))
        return normalized in {normalize_answer(item) for item in question["accepted"]}
    return answer == question["correct"]


def point_change(correct: bool, seconds_left: int, streak: int, difficulty: str) -> int:
    """Award speed/streak points, or subtract a difficulty-scaled penalty."""
    multiplier = POINT_MULTIPLIERS[difficulty]
    if not correct:
        return -round(50 * multiplier)
    return round((100 + seconds_left * 4 + streak * 25) * multiplier)
