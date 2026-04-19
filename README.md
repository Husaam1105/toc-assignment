# Parse Quest: CFG ↔ PDA Simulator

**Parse Quest** is an interactive, educational simulator designed to visualize the mechanical equivalence between Context-Free Grammars (CFG) and Pushdown Automata (PDA). It demonstrates the top-down parsing process through a real-time stack, dynamic parse tree, and interactive state machine diagram.

## 🚀 Key Features

- **Interactive Parsing Modes**: 
  - 🤖 **Auto Mode**: Watch the parser automatically derive the string step-by-step.
  - 🕹️ **Manual Mode**: Test your knowledge by predicting the next grammar rule to apply.
- **Real-time Visualizations**:
  - **Dynamic Stack**: Tracks the symbols pushed and popped during the nondeterministic parsing process.
  - **Live Parse Tree**: Animates the growth of the derivation tree as variables are expanded.
  - **PDA State Machine**: A responsive diagram that highlights active states and transitions mapped to the current parsing action.
- **Level System**:
  - Pre-built educational levels (e.g., $a^nb^n$, Balanced Parentheses, Palindromes).
  - **Custom Grammar Mode**: Input your own CFG rules and test any string.
- **Premium UI/UX**: Modern, clean light-themed interface built for clarity and accessibility.

## 🛠️ Built With

- **React 19** + **Vite**
- **TypeScript** (Strict Type Safety)
- **Vanilla CSS** (Custom Premium Design System)

## 🏗️ Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Husaam1105/toc-assignment.git
   cd toc-assignment/game
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📚 Educational Context

This project implements the **Top-Down Parsing** algorithm to convert a CFG into an equivalent PDA. For any given CFG $G$, the parser builds a PDA that simulates a leftmost derivation of the input string, maintaining the yet-to-be-expanded variables on the stack.

## 👤 Author

**Husaamuddin Ahmed**  
S20240010147 | UG-2 CSE  
**IIIT Sri City**  
[GitHub Profile](https://github.com/Husaam1105)

---
*Developed as part of the Theory of Computation (TOC) coursework.*
