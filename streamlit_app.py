"""AquaMath — a Python/Streamlit adaptive hydration-math quiz."""

import time

import streamlit as st

from questions import QUESTIONS
from quiz_logic import is_correct, next_difficulty, point_change, time_limit


st.set_page_config(page_title="AquaMath", page_icon="💧", layout="centered")

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Manrope:wght@700;800&display=swap');
    .stApp { background: radial-gradient(circle at 80% 8%, #dff5fb, transparent 28%), #f5fbfb; color: #153c57; font-family: 'DM Sans', sans-serif; }
    #MainMenu, footer, header { visibility: hidden; }
    .block-container { max-width: 900px; padding-top: 2rem; padding-bottom: 4rem; }
    h1, h2, h3 { font-family: 'Manrope', sans-serif !important; color: #103953 !important; }
    .brand { font: 800 21px 'Manrope'; color: #123d58; margin-bottom: 2.5rem; }
    .brand span { color: #2388c2; } .brand b { display:inline-grid; place-items:center; width:38px; height:38px; margin-right:9px; border-radius:12px; color:white; background:#238fc9; transform:rotate(-7deg); }
    .hero { padding: 1.5rem 0 1rem; } .eyebrow { color:#2388c2; font-size:.72rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
    .hero h1 { font-size: clamp(2.8rem, 7vw, 4.8rem); line-height:1.02; letter-spacing:-.055em; margin:.8rem 0 1rem; }
    .hero h1 span { color:#2388c2; } .hero p { max-width:660px; color:#58757a; font-size:1.05rem; line-height:1.65; }
    .feature-row, .impact-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin:1.6rem 0; }
    .feature, .impact { padding:16px; border:1px solid #dcebea; border-radius:15px; background:white; }
    .feature b, .impact b { color:#173f59; font-size:.82rem; } .feature p, .impact p { color:#78918f; font-size:.7rem; line-height:1.5; margin:.35rem 0 0; }
    .impact-wrap { margin-top:2.5rem; padding:24px; border-radius:22px; color:white; background:#103b57; }
    .impact-wrap h2 { color:white !important; margin:.3rem 0 .5rem; }.impact-wrap>p { color:#bad2dc; font-size:.8rem; }.impact { background:#ffffff0b; border-color:#ffffff18; }.impact b { color:#71d1ee; }.impact p { color:#c0d4dd; }
    .hud { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:.7rem; }.pill { display:inline-block; padding:6px 10px; border-radius:99px; background:#eaf6fa; color:#197eb6; font-size:.7rem; font-weight:800; margin-left:6px; }
    .question-card { padding:28px; border:1px solid #dcebea; border-radius:23px; background:white; box-shadow:0 18px 50px #17484112; }.question-card .topic { color:#2388c2; font-size:.65rem; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }.question-card h2 { font-size:1.65rem; line-height:1.3; margin:.8rem 0 .4rem; }.detail { color:#78908e; font-size:.78rem; }
    .vessel-scene { height:145px; margin:16px 0; display:grid; place-items:center; perspective:600px; border-radius:17px; background:linear-gradient(145deg,#f8fdff,#edf8fb); overflow:hidden; }.vessel { width:76px; height:112px; position:relative; border:3px solid #82c3dd; border-top:9px solid #69acd0; border-radius:8px 8px 23px 23px; overflow:hidden; transform:rotateY(-12deg); box-shadow:10px 12px 22px #17638a25,inset 7px 0 12px #fff; }.liquid { position:absolute; left:0; right:0; bottom:0; background:linear-gradient(155deg,#77d6f1,#278fc7 65%,#1d72aa); }.liquid:before { content:''; position:absolute; left:-4px; right:-4px; top:-6px; height:12px; border-radius:50%; background:#8cdef4; }
    .feedback { padding:15px 17px; margin-top:16px; border-radius:14px; }.correct { background:#eaf8f4; color:#17685f; }.wrong { background:#fff1ed; color:#8e473c; }.feedback b { display:block; margin-bottom:4px; }.feedback p { margin:0; font-size:.78rem; }
    .answer-compare { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }.answer-compare div { padding:9px; border-radius:9px; background:#ffffff99; }.answer-compare small { display:block; opacity:.7; }.answer-compare strong { font-size:.82rem; }
    .timer-low { animation:pulse .7s infinite alternate; color:#d74f3c; font-weight:800; } @keyframes pulse { to { transform:scale(1.06); } }
    .results-hero { text-align:center; padding:2rem 0 1rem; }.score-drop { width:120px; height:120px; display:grid; place-items:center; margin:auto; border-radius:55% 45% 55% 45%; color:white; background:#238fc9; font:800 1.55rem 'Manrope'; transform:rotate(8deg); }.score-drop span { transform:rotate(-8deg); }
    .recap { display:grid; grid-template-columns:repeat(6,1fr); gap:7px; margin:1.2rem 0; }.recap div { text-align:center; padding:9px 3px; border-radius:11px; font-size:.7rem; font-weight:800; }.recap .yes { background:#eaf8f4; color:#188875; }.recap .no { background:#fff1ed; color:#c15c4b; }
    div.stButton>button { border:0; border-radius:12px; font-weight:800; min-height:44px; }.primary button { color:white !important; background:linear-gradient(135deg,#45b9e3,#197ab5) !important; }
    @media(max-width:650px){.feature-row,.impact-row{grid-template-columns:1fr}.question-card{padding:20px}.recap{grid-template-columns:repeat(3,1fr)}}
    </style>
    """,
    unsafe_allow_html=True,
)


DEFAULTS = {
    "screen": "home", "starting_difficulty": "medium", "active_difficulty": "medium",
    "question_number": 0, "answered": False, "last_correct": False,
    "selected_answer": None, "points": 0, "streak": 0, "history": [],
    "deadline": 0.0, "limit": 30, "next_level": "medium", "best": 0,
}
for key, value in DEFAULTS.items():
    if key not in st.session_state:
        st.session_state[key] = value


def current_question() -> dict:
    return QUESTIONS[st.session_state.active_difficulty][st.session_state.question_number]


def seconds_remaining() -> int:
    return max(0, round(st.session_state.deadline - time.time()))


def start_quiz() -> None:
    level = st.session_state.starting_difficulty
    st.session_state.update(
        screen="quiz", active_difficulty=level, question_number=0, answered=False,
        last_correct=False, selected_answer=None, points=0, streak=0, history=[],
        limit=time_limit(level, 0), next_level=level,
    )
    st.session_state.deadline = time.time() + st.session_state.limit


def submit_answer(answer, timed_out: bool = False) -> None:
    if st.session_state.answered:
        return
    question = current_question()
    remaining = seconds_remaining()
    correct = False if timed_out else is_correct(question, answer)
    old_streak = st.session_state.streak
    change = point_change(correct, remaining, old_streak, st.session_state.active_difficulty)
    st.session_state.points = max(0, st.session_state.points + change)
    st.session_state.streak = old_streak + 1 if correct else 0
    elapsed = st.session_state.limit - remaining
    fast = elapsed <= st.session_state.limit * 0.55
    next_level = next_difficulty(st.session_state.active_difficulty, correct, fast)
    st.session_state.history.append({
        "correct": correct, "seconds": elapsed, "level": st.session_state.active_difficulty,
        "answer": "Time ran out" if timed_out else str(answer), "question": question,
    })
    st.session_state.update(answered=True, last_correct=correct, selected_answer=answer, next_level=next_level)


def advance() -> None:
    if st.session_state.question_number == 5:
        st.session_state.best = max(st.session_state.best, st.session_state.points)
        st.session_state.screen = "results"
        return
    st.session_state.question_number += 1
    st.session_state.active_difficulty = st.session_state.next_level
    st.session_state.answered = False
    st.session_state.selected_answer = None
    st.session_state.limit = time_limit(st.session_state.active_difficulty, st.session_state.question_number)
    st.session_state.deadline = time.time() + st.session_state.limit


def brand() -> None:
    st.markdown('<div class="brand"><b>◆</b>Aqua<span>Math</span></div>', unsafe_allow_html=True)


def bottle(fill: int) -> None:
    st.markdown(f'<div class="vessel-scene"><div class="vessel"><div class="liquid" style="height:{fill}%"></div></div></div>', unsafe_allow_html=True)


def home_screen() -> None:
    brand()
    st.markdown('<section class="hero"><div class="eyebrow">Math that makes a splash</div><h1>Train your brain.<br><span>Fuel your body.</span></h1><p>Six adaptive hydration-math challenges with shrinking clocks, streaks, points, and increasingly unhinged word problems—all powered by readable Python.</p></section>', unsafe_allow_html=True)
    st.session_state.starting_difficulty = st.radio("Choose your starting difficulty", ["easy", "medium", "hard"], index=["easy", "medium", "hard"].index(st.session_state.starting_difficulty), horizontal=True, format_func=str.title)
    if st.button("Start adaptive quiz  →", type="primary", use_container_width=False):
        start_quiz(); st.rerun()
    st.caption("No sign-up · About 3 minutes · Built with Python + Streamlit")
    st.markdown('<div class="feature-row"><div class="feature"><b>⏱ Timed challenge</b><p>Each question gets a little faster.</p></div><div class="feature"><b>↗ Adaptive difficulty</b><p>Your answers control the next level.</p></div><div class="feature"><b>✓ Instant explanations</b><p>Learn from every calculation.</p></div></div>', unsafe_allow_html=True)
    st.markdown('<section class="impact-wrap"><small>WHY AQUAMATH?</small><h2>Useful math should feel useful.</h2><p>Students often practice calculations without seeing where they matter, while health lessons can feel passive.</p><div class="impact-row"><div class="impact"><b>01 · Connect</b><p>Math meets real hydration scenarios.</p></div><div class="impact"><b>02 · Adapt</b><p>The challenge responds to each player.</p></div><div class="impact"><b>03 · Remember</b><p>Strange stories make practice replayable.</p></div></div></section>', unsafe_allow_html=True)


@st.fragment(run_every=1)
def live_timer() -> None:
    remaining = seconds_remaining()
    if not st.session_state.answered and remaining <= 0:
        submit_answer("__timeout__", timed_out=True)
        st.rerun()
    warning = "timer-low" if remaining <= 10 and not st.session_state.answered else ""
    st.markdown(f'<div class="{warning}">⏱ {remaining}s remaining</div>', unsafe_allow_html=True)
    st.progress(remaining / st.session_state.limit if st.session_state.limit else 0)


def quiz_screen() -> None:
    brand()
    left, right = st.columns([2, 3])
    with left:
        if st.button("← Exit"):
            st.session_state.screen = "home"; st.rerun()
    with right:
        st.markdown(f'<div class="hud"><span>Adaptive: <b>{st.session_state.active_difficulty.title()}</b></span><span><i class="pill">{st.session_state.points:,} pts</i><i class="pill">{st.session_state.streak} streak</i></span></div>', unsafe_allow_html=True)
    live_timer()
    question = current_question()
    st.markdown(f'<article class="question-card"><span class="topic">{st.session_state.active_difficulty} · {question["topic"]} · Question {st.session_state.question_number + 1}/6</span><h2>{question["prompt"]}</h2><p class="detail">{question["detail"]}</p>', unsafe_allow_html=True)
    bottle(question["fill"])
    with st.expander("✎ Optional scratchpad"):
        st.text_area("Work through the calculation", key=f"scratch-{st.session_state.question_number}", height=110, label_visibility="collapsed")

    if not st.session_state.answered:
        if question["type"] == "choice":
            columns = st.columns(2)
            for index, answer in enumerate(question["answers"]):
                if columns[index % 2].button(f"{chr(65 + index)}  ·  {answer}", key=f"answer-{st.session_state.question_number}-{index}", use_container_width=True):
                    submit_answer(index); st.rerun()
        else:
            with st.form(f"short-{st.session_state.question_number}"):
                response = st.text_input("Your answer", placeholder="Example: 750 mL")
                if st.form_submit_button("Check answer") and response.strip():
                    submit_answer(response.strip()); st.rerun()
    else:
        result = st.session_state.history[-1]
        css_class = "correct" if result["correct"] else "wrong"
        heading = "You nailed it!" if result["correct"] else "Not quite—here’s the pour."
        if result["answer"] == "Time ran out":
            heading = "Time’s up—the bottle ran dry!"
        compare = ""
        if question["type"] == "short":
            compare = f'<div class="answer-compare"><div><small>Your answer</small><strong>{result["answer"]}</strong></div><div><small>Correct answer</small><strong>{question["sample"]}</strong></div></div>'
        st.markdown(f'<div class="feedback {css_class}"><b>{heading}</b><p>{question["explanation"]}</p>{compare}<p>Next level: <b>{st.session_state.next_level.title()}</b></p></div>', unsafe_allow_html=True)
        if st.button("See results →" if st.session_state.question_number == 5 else "Next question →", type="primary"):
            advance(); st.rerun()
    st.markdown('</article>', unsafe_allow_html=True)


def results_screen() -> None:
    brand()
    correct = sum(item["correct"] for item in st.session_state.history)
    average = round(sum(item["seconds"] for item in st.session_state.history) / 6)
    title = "Perfect pour!" if correct == 6 else "Making waves!" if correct >= 4 else "A strong first splash!"
    st.markdown(f'<section class="results-hero"><div class="score-drop"><span>{correct}/6</span></div><h1>{title}</h1><p>{st.session_state.points:,} points · {average}s average response</p></section>', unsafe_allow_html=True)
    cols = st.columns(3)
    cols[0].metric("Accuracy", f"{round(correct / 6 * 100)}%")
    cols[1].metric("Questions", "6")
    cols[2].metric("Personal best", f"{st.session_state.best:,}")
    recap = ''.join(f'<div class="{"yes" if item["correct"] else "no"}">Q{index + 1}<br>{"✓" if item["correct"] else "×"}<br>{item["seconds"]}s</div>' for index, item in enumerate(st.session_state.history))
    st.markdown(f'<div class="recap">{recap}</div>', unsafe_allow_html=True)
    share_text = f'I scored {st.session_state.points:,} points on AquaMath ({correct}/6 correct). Can you beat my current?'
    with st.expander("Challenge a friend"):
        st.code(share_text, language=None)
    left, right = st.columns(2)
    if left.button("Play again", type="primary", use_container_width=True):
        start_quiz(); st.rerun()
    if right.button("Change starting difficulty", use_container_width=True):
        st.session_state.screen = "home"; st.rerun()
    st.caption("These are math scenarios, not personal intake targets. Hydration needs vary by person and conditions.")


if st.session_state.screen == "home":
    home_screen()
elif st.session_state.screen == "quiz":
    quiz_screen()
else:
    results_screen()
