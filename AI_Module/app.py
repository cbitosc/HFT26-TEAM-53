
import streamlit as st
from AI_Module.answer_engine import ask_codelens

# Page configuration
st.set_page_config(
    page_title="CodeLens AI",
    page_icon="🔍",
    layout="wide"
)

# Application heading
st.title("🔍 CodeLens AI")
st.subheader("AI-Powered Repository Exploration")

st.write(
    "Explore unfamiliar code repositories easily. "
    "Ask questions and let AI find relevant files "
    "and explain how your code works."
)

st.divider()

# Question input
st.header("Ask Your Repository")

question = st.text_area(
    "Enter your question:",
    placeholder="Example: Where is the AI response generated?",
    height=100
)

# Ask AI button
if st.button("Ask CodeLens AI", type="primary"):

    if question.strip():

        with st.spinner("Analyzing your repository..."):

            try:
                answer = ask_codelens(question)

                st.success("Analysis completed!")

                st.header("🤖 AI Answer")
                st.write(answer)

            except Exception as e:
                st.error(f"An error occurred: {e}")

    else:
        st.warning("Please enter a question.")

st.divider()

st.caption(
    "CodeLens AI | Helping developers understand unfamiliar repositories"
)
