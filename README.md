# AquaMath — Python Edition

AquaMath is an adaptive hydration-math game written in Python with Streamlit.
Players solve six timed word problems while the difficulty responds to their
speed and accuracy.

## How the code is organized

- `streamlit_app.py` builds the screens and handles player interaction.
- `questions.py` stores the three question banks.
- `quiz_logic.py` contains scoring, timing, grading, and adaptive difficulty.
- `tests/test_quiz_logic.py` checks the most important rules.

## Run it

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Test it

```bash
python3 -m unittest discover -s tests
```

The original React version is preserved on the `main` branch. This Python
rewrite lives on the `python-streamlit` branch.
