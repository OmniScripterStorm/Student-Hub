---
id: reviewer_summative_test_2_finite_math
subject: Finite Math
tag: Elective
title: Summative Test 2 - Finite Math Reviewer: Probability
summary: Comprehensive, high-yield exam reviewer covering Introduction to Probability (Sample Spaces, Axioms, Addition Rules, Complements), Conditional Probability, Independence, Law of Total Probability, and Bayes' Theorem with fully worked step-by-step problems.
badge: Quarter 1 / Summative 2
---

# 1. Foundations of Probability & Sample Spaces

Probability provides a mathematical model for measuring uncertainty and likelihood. In finite mathematics, random experiments involve well-defined sets of outcomes where every outcome can be cataloged into a sample space.

### Core Terminology:
- **Random Experiment ($\mathcal{E}$)**: An observational process whose exact outcome cannot be predetermined with certainty, though all possible outcomes are known in advance (e.g. flipping a fair coin twice).
- **Outcome ($\omega$)**: A single, indivisible result of performing a random experiment once (e.g. $(H, T)$).
- **Sample Space ($S$ or $\Omega$)**: The universal set consisting of all possible distinct outcomes of an experiment ($S = \{HH, HT, TH, TT\}$, $n(S) = 4$).
- **Event ($E \subseteq S$)**: Any specific subset of the sample space $S$ satisfying a stated condition.
- **Null / Impossible Event ($\emptyset$)**: The empty subset containing zero outcomes ($P(\emptyset) = 0$).
- **Certain / Sure Event ($S$)**: The entire sample space ($P(S) = 1$).

### Classical Probability Definition:
$$ P(E) = \frac{n(E)}{n(S)} = \frac{\text{Number of favorable outcomes}}{\text{Total number of equally likely outcomes in } S} $$

### Kolmogorov's Axioms & Boundary Constraints:
1. **Non-Negativity**: $0 \le P(E) \le 1$
2. **Total Certainty**: $P(S) = 1$
3. **Additivity for Disjoint Events**: If $A \cap B = \emptyset$, then $P(A \cup B) = P(A) + P(B)$
4. **Complementarity**: $P(E') = 1 - P(E)$

### Odds in Favor vs. Odds Against:
$$ \text{Odds in Favor of } E = \frac{P(E)}{1 - P(E)} = \frac{n(E)}{n(E')} = a : b $$
$$ \text{Odds Against } E = \frac{1 - P(E)}{P(E)} = \frac{n(E')}{n(E)} = b : a $$
Conversion to probability: $P(E) = \frac{a}{a + b}$.

---

# 2. The Complement Rule & "At Least One" Principle

The complement of an event $A$, denoted $A'$ or $A^c$, contains all outcomes in $S$ not in $A$:
$$ P(A') = 1 - P(A) \iff P(A) = 1 - P(A') $$

### The "At Least One" Shortcut:
When an exam asks for "at least one", always compute the complement:
$$ P(\text{at least one success}) = 1 - P(\text{zero successes / none}) $$

- **At least one 6 on 4 dice**: $P(\text{at least one 6}) = 1 - \left(\frac{5}{6}\right)^4 = 1 - \frac{625}{1296} = \frac{671}{1296} \approx 0.5177$ (51.8%).
- **At least one Head on 5 coin flips**: $P(\text{at least one Head}) = 1 - \left(\frac{1}{2}\right)^5 = 1 - \frac{1}{32} = \frac{31}{32} = 0.96875$ (96.9%).

---

# 3. Addition Rules & Inclusion-Exclusion for Probability

### Disjoint (Mutually Exclusive) Events ($A \cap B = \emptyset$):
$$ P(A \cup B) = P(A) + P(B) $$

### General Addition Rule (Overlapping Events):
$$ P(A \cup B) = P(A) + P(B) - P(A \cap B) $$
$$ P(A \cap B) = P(A) + P(B) - P(A \cup B) $$

### Three-Event Addition Rule:
$$ P(A \cup B \cup C) = P(A) + P(B) + P(C) - [P(A \cap B) + P(A \cap C) + P(B \cap C)] + P(A \cap B \cap C) $$

---

# 4. Conditional Probability & The Multiplication Rule

The given condition acts as a **relative sample space**:
$$ P(A \mid B) = \frac{P(A \cap B)}{P(B)} = \frac{n(A \cap B)}{n(B)}, \quad \text{where } P(B) > 0 $$

### General Multiplication Rule:
$$ P(A \cap B) = P(B) \cdot P(A \mid B) = P(A) \cdot P(B \mid A) $$

### Independent Events:
Events $A$ and $B$ are independent if knowing that $B$ occurred does not alter the likelihood of $A$:
$$ P(A \mid B) = P(A) \iff P(A \cap B) = P(A) \cdot P(B) $$

> **CRITICAL EXAM TRAP**: Mutually exclusive events with positive probabilities are **NEVER independent**. If $A$ and $B$ are mutually exclusive, $P(A \cap B) = 0 \ne P(A)P(B)$.

---

# 5. The Law of Total Probability

If $B_1, B_2, \dots, B_n$ partition the sample space $S$ ($\bigcup B_i = S$, $B_i \cap B_j = \emptyset$):
$$ P(A) = \sum_{i=1}^n P(A \cap B_i) = \sum_{i=1}^n [P(A \mid B_i) \cdot P(B_i)] $$

For two partitions ($B$ and $B'$):
$$ P(A) = P(A \mid B) \cdot P(B) + P(A \mid B') \cdot P(B') $$

---

# 6. Bayes' Theorem (Inverse / Posterior Probability)

Bayes' Theorem inverts conditional probabilities to update prior beliefs given observed evidence:

### Two-Event Form:
$$ P(B \mid A) = \frac{P(A \cap B)}{P(A)} = \frac{P(B) \cdot P(A \mid B)}{P(A \mid B)P(B) + P(A \mid B')P(B')} $$

### Generalized Bayes' Theorem:
$$ P(B_k \mid A) = \frac{P(B_k) \cdot P(A \mid B_k)}{\sum_{i=1}^n [P(B_i) \cdot P(A \mid B_i)]} = \frac{P(B_k \cap A)}{P(A)} $$

---

# 7. Step-by-Step Worked Reference Problems

### Example 1: Partition Overlap Summation
$B_1, B_2$ partition $S$. $P(A \cap B_1) = 0.15$, $P(A \cap B_2) = 0.35$.
$$ P(A) = 0.15 + 0.35 = 0.50 $$

### Example 2: Two-Supplier Circuit Board Defect Rate
- Supplier 1: $P(B_1) = 0.70$, $P(D \mid B_1) = 0.04$
- Supplier 2: $P(B_2) = 0.30$, $P(D \mid B_2) = 0.09$
$$ P(D) = P(D \mid B_1)P(B_1) + P(D \mid B_2)P(B_2) = (0.04)(0.70) + (0.09)(0.30) = 0.028 + 0.027 = 0.055 \text{ (5.5%)} $$

### Example 3: Three-Section University Course Pass Rate
- Section 1: $P(S_1) = 0.30$, Pass rate $P(\text{Pass} \mid S_1) = 0.80$
- Section 2: $P(S_2) = 0.50$, Pass rate $P(\text{Pass} \mid S_2) = 0.70$
- Section 3: $P(S_3) = 0.20$, Pass rate $P(\text{Pass} \mid S_3) = 0.90$
$$ P(\text{Pass}) = (0.80)(0.30) + (0.70)(0.50) + (0.90)(0.20) = 0.24 + 0.35 + 0.18 = 0.77 \text{ (77%)} $$

### Example 4: Diagnostic Screening & The False Positive Paradox
- Disease prevalence: $P(D) = 0.01$
- Sensitivity: $P(+ \mid D) = 0.95$
- Total positive rate: $P(+) = 0.0394$
$$ P(D \mid +) = \frac{P(D) \cdot P(+ \mid D)}{P(+)} = \frac{(0.01)(0.95)}{0.0394} = \frac{0.0095}{0.0394} \approx 0.2411 \text{ (24.11%)} $$

### Example 5: Three-Factory Widget Quality Control (Complete Bayes Analysis)
- $P(F_1) = 0.20, P(D \mid F_1) = 0.01 \implies P(F_1 \cap D) = 0.002$
- $P(F_2) = 0.50, P(D \mid F_2) = 0.03 \implies P(F_2 \cap D) = 0.015$
- $P(F_3) = 0.30, P(D \mid F_3) = 0.02 \implies P(F_3 \cap D) = 0.006$
- Total defect rate: $P(D) = 0.002 + 0.015 + 0.006 = 0.023$
- **(a) Defective widget from Factory 1**:
  $$ P(F_1 \mid D) = \frac{0.002}{0.023} = \frac{2}{23} \approx 8.70\% $$
- **(b) Defective widget from Factory 2 or Factory 3**:
  $$ P(F_2 \cup F_3 \mid D) = 1 - P(F_1 \mid D) = 1 - \frac{2}{23} = \frac{21}{23} \approx 91.30\% $$
- **(c) Non-defective widget from Factory 3**:
  $$ P(F_3 \mid D') = \frac{P(F_3)P(D' \mid F_3)}{P(D')} = \frac{0.30 \times 0.98}{1 - 0.023} = \frac{0.294}{0.977} \approx 30.09\% $$
