import unittest

from quiz_logic import is_correct, next_difficulty, point_change, time_limit


class QuizLogicTests(unittest.TestCase):
    def test_time_shrinks_but_never_below_twelve(self):
        self.assertEqual(time_limit("medium", 0), 30)
        self.assertEqual(time_limit("hard", 99), 12)

    def test_adaptive_difficulty(self):
        self.assertEqual(next_difficulty("medium", True, True), "hard")
        self.assertEqual(next_difficulty("medium", False, False), "easy")
        self.assertEqual(next_difficulty("hard", True, True), "hard")

    def test_short_answer_accepts_equivalent_spacing(self):
        question = {"type": "short", "accepted": ["600 ml"]}
        self.assertTrue(is_correct(question, "600mL"))

    def test_wrong_answer_loses_points(self):
        self.assertLess(point_change(False, 10, 0, "hard"), 0)


if __name__ == "__main__":
    unittest.main()
