#!/usr/bin/env python3
"""
Generates the Summative 2 Finite Math Reviewer on Probability:
- Introduction to Probability: Sample Spaces, Addition Rules & Complements
- Conditional Probability, Law of Total Probability & Bayes' Theorem
"""

import json
import os

def generate_reviewer():
    blocks = [
        # -------------------------------------------------------------
        # 1. FOUNDATIONS OF PROBABILITY THEORY & SAMPLE SPACES
        # -------------------------------------------------------------
        {
            "type": "heading",
            "level": "h2",
            "text": "1. Foundations of Probability & Sample Spaces"
        },
        {
            "type": "paragraph",
            "text": "Probability provides a mathematical model for measuring uncertainty and likelihood. In finite mathematics, random experiments involve well-defined sets of outcomes where every outcome can be cataloged into a sample space."
        },
        {
            "type": "table",
            "title": "Core Probability Terminology & Mathematical Notations",
            "headers": ["Term / Concept", "Symbol", "Rigorous Definition", "Concrete Finite Example"],
            "rows": [
                [
                    "Random Experiment",
                    "$\\mathcal{E}$",
                    "An observational process whose exact outcome cannot be predetermined with certainty, though all possible outcomes are known in advance.",
                    "Flipping a fair coin twice, or rolling a fair 6-sided die."
                ],
                [
                    "Outcome",
                    "$\\omega$",
                    "A single, indivisible result of performing a random experiment once.",
                    "Getting a Head on flip 1 and Tail on flip 2: $(H, T)$."
                ],
                [
                    "Sample Space",
                    "$S$ or $\\Omega$",
                    "The universal set consisting of all possible distinct outcomes of an experiment.",
                    "$S = \\{HH, HT, TH, TT\\}$, with cardinality $n(S) = 4$."
                ],
                [
                    "Event",
                    "$E \\subseteq S$",
                    "Any specific subset of the sample space $S$ satisfying a stated condition.",
                    "$E = \\text{getting exactly one Head} = \\{HT, TH\\}$."
                ],
                [
                    "Null / Impossible Event",
                    "$\\emptyset$",
                    "The empty subset containing zero outcomes; cannot occur under any circumstance.",
                    "Rolling a 7 on a standard 6-sided die; $P(\\emptyset) = 0$."
                ],
                [
                    "Certain / Sure Event",
                    "$S$",
                    "The entire sample space; must inevitably occur on every trial of the experiment.",
                    "Rolling an integer between 1 and 6 inclusive; $P(S) = 1$."
                ]
            ]
        },
        {
            "type": "formula",
            "title": "Classical (Theoretical) Probability Definition",
            "formula": "P(E) = \\frac{n(E)}{n(S)} = \\frac{\\text{Number of favorable outcomes}}{\\text{Total number of equally likely outcomes in } S}",
            "note": "Applicable strictly when all outcomes in sample space S are equally likely (equiprobable)."
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Kolmogorov's Probability Axioms & Range Bounds"
        },
        {
            "type": "table",
            "title": "Axioms of Probability & Fundamental Boundary Constraints",
            "headers": ["Axiom / Property", "Mathematical Statement", "Significance & Exam Application"],
            "rows": [
                [
                    "Axiom 1: Non-Negativity",
                    "$0 \\le P(E) \\le 1$",
                    "Probability can never be negative and can never exceed 1 (or 0% to 100%). Any calculation yielding $P < 0$ or $P > 1$ is an algebraic error."
                ],
                [
                    "Axiom 2: Total Certainty",
                    "$P(S) = 1$",
                    "The probability that SOME outcome within the sample space occurs is absolute certainty (100%)."
                ],
                [
                    "Axiom 3: Additivity of Disjoint Events",
                    "$P(A \\cup B) = P(A) + P(B)$",
                    "If events $A$ and $B$ are mutually exclusive ($A \\cap B = \\emptyset$), their joint union probability is the direct sum of their individual probabilities."
                ],
                [
                    "Complementarity",
                    "$P(E') = 1 - P(E)$",
                    "The probability of an event NOT occurring equals 1 minus the probability that it DOES occur."
                ]
            ]
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Standard Sample Spaces for Exam Problems"
        },
        {
            "type": "bullets",
            "items": [
                "**Two Fair 6-Sided Dice ($n(S) = 36$)**: Outcomes are ordered pairs $(d_1, d_2)$ where $d_1, d_2 \\in \\{1, 2, 3, 4, 5, 6\\}$. The sum of faces ranges from 2 to 12. Most frequent sum is $7$ with 6 outcomes: $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1) \\implies P(\\text{sum} = 7) = \\frac{6}{36} = \\frac{1}{6}$.",
                "**Standard 52-Card Deck ($n(S) = 52$)**: 4 suits ($\\text{Hearts } \\heartsuit, \\text{Diamonds } \\diamondsuit$ [26 Red]; $\\text{Clubs } \\clubsuit, \\text{Spades } \\spadesuit$ [26 Black]). 13 cards per suit: Aces (4), Numerals 2–10 (36), Face Cards (12: Jacks, Queens, Kings). $P(\\text{Face Card}) = \\frac{12}{52} = \\frac{3}{13}$; $P(\\text{Ace}) = \\frac{4}{52} = \\frac{1}{13}$.",
                "**Coin Tossing Sequences ($n(S) = 2^k$)**: Tossing $k$ coins yields $2^k$ outcomes. Tossing 3 coins yields $2^3 = 8$ outcomes: $\\{HHH, HHT, HTH, HTT, THH, THT, TTH, TTT\\}$."
            ]
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Odds in Favor vs. Odds Against"
        },
        {
            "type": "paragraph",
            "text": "Odds express a ratio of favorable outcomes directly to unfavorable outcomes, rather than favorable outcomes to the total sample space:"
        },
        {
            "type": "formula",
            "title": "Odds in Favor & Odds Against Formulas",
            "formula": "\\text{Odds in Favor of } E = \\frac{P(E)}{1 - P(E)} = \\frac{n(E)}{n(E')} = a : b, \\qquad \\text{Odds Against } E = \\frac{1 - P(E)}{P(E)} = \\frac{n(E')}{n(E)} = b : a",
            "note": "Where a = favorable outcomes, b = unfavorable outcomes, and total outcomes n(S) = a + b."
        },
        {
            "type": "callout",
            "style": "info",
            "title": "Rapid Conversion Trick: Odds to Probability",
            "text": "If the odds in favor of an event $E$ are given as $a : b$:\n$$P(E) = \\frac{a}{a + b}, \\qquad P(E') = \\frac{b}{a + b}$$\n*Example*: If the odds in favor of a team winning are $3 : 7$, the probability of winning is $P(\\text{Win}) = \\frac{3}{3 + 7} = \\frac{3}{10} = 0.30$ (or 30%). If odds against are $5 : 2$, odds in favor are $2 : 5$, so $P(E) = \\frac{2}{2 + 5} = \\frac{2}{7}$."
        },

        # -------------------------------------------------------------
        # 2. THE COMPLEMENT RULE & THE "AT LEAST ONE" PRINCIPLE
        # -------------------------------------------------------------
        {
            "type": "heading",
            "level": "h2",
            "text": "2. The Complement Rule & 'At Least One' Principle"
        },
        {
            "type": "paragraph",
            "text": "The complement of an event $A$, denoted $A'$ or $A^c$, contains all outcomes in the sample space $S$ that do NOT belong to $A$. Since $A$ and $A^c$ are disjoint and exhaustive ($A \\cup A^c = S$ and $A \\cap A^c = \\emptyset$):"
        },
        {
            "type": "formula",
            "title": "The Complement Rule",
            "formula": "P(A') = 1 - P(A) \\iff P(A) = 1 - P(A')",
            "note": "Equivalent notations: P(A') = P(A^c) = P(\\bar{A}) = 1 - P(A)."
        },
        {
            "type": "callout",
            "style": "warning",
            "title": "Exam High-Yield Shortcut: The 'At Least One' Strategy",
            "text": "When an exam problem contains the phrase **'at least one'** (e.g., *'find the probability of getting at least one 6 when rolling 4 dice'*), **NEVER** compute the probabilities of 1, 2, 3, and 4 successes individually and add them up. Always take the complement:\n$$P(\\text{at least one success}) = 1 - P(\\text{zero successes / none})$$"
        },
        {
            "type": "bullets",
            "items": [
                "**At Least One 6 on 4 Dice**: $P(\\text{no 6 on a single die}) = \\frac{5}{6}$. For 4 independent dice, $P(\\text{no 6 on all 4}) = \\left(\\frac{5}{6}\\right)^4 = \\frac{625}{1296} \\approx 0.4823$. Therefore, $P(\\text{at least one 6}) = 1 - \\frac{625}{1296} = \\frac{671}{1296} \\approx 0.5177$ (51.8%).",
                "**At Least One Head on 5 Coin Flips**: $P(\\text{zero heads}) = P(\\text{all tails}) = \\left(\\frac{1}{2}\\right)^5 = \\frac{1}{32}$. Therefore, $P(\\text{at least one head}) = 1 - \\frac{1}{32} = \\frac{31}{32} = 0.96875$ (96.9%)."
            ]
        },

        # -------------------------------------------------------------
        # 3. ADDITION RULES & MULTI-EVENT INCLUSION-EXCLUSION
        # -------------------------------------------------------------
        {
            "type": "heading",
            "level": "h2",
            "text": "3. Addition Rules & Inclusion-Exclusion for Probability"
        },
        {
            "type": "paragraph",
            "text": "The Addition Rule calculates the probability of the union of events ($A \\cup B$), corresponding to the logical operator **OR** (i.e., that event $A$ occurs, event $B$ occurs, or both occur)."
        },
        {
            "type": "table",
            "title": "Mutually Exclusive vs. Overlapping Events Comparison",
            "headers": ["Classification", "Mutually Exclusive (Disjoint)", "Overlapping (Non-Mutually Exclusive)"],
            "rows": [
                [
                    "Conceptual Meaning",
                    "Events cannot occur simultaneously on the same trial. If one happens, all others cannot.",
                    "Events share common outcomes and can occur at the exact same time."
                ],
                [
                    "Intersection",
                    "$A \\cap B = \\emptyset \\implies P(A \\cap B) = 0$",
                    "$A \\cap B \\ne \\emptyset \\implies P(A \\cap B) > 0$"
                ],
                [
                    "Venn Diagram",
                    "Two separate, non-touching circles.",
                    "Two overlapping circles with a shared central football region."
                ],
                [
                    "Union Formula",
                    "$P(A \\cup B) = P(A) + P(B)$",
                    "$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$"
                ],
                [
                    "Card Example",
                    "Drawing a King OR drawing an Ace ($0$ overlap).",
                    "Drawing a King OR drawing a Heart (the King of Hearts is shared!)."
                ]
            ]
        },
        {
            "type": "formula",
            "title": "General Addition Rule (Inclusion-Exclusion for Two Events)",
            "formula": "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)",
            "note": "Rearrangement for shared overlap: P(A \\cap B) = P(A) + P(B) - P(A \\cup B)."
        },
        {
            "type": "formula",
            "title": "Three-Event Addition Rule (Inclusion-Exclusion)",
            "formula": "P(A \\cup B \\cup C) = P(A) + P(B) + P(C) - [P(A \\cap B) + P(A \\cap C) + P(B \\cap C)] + P(A \\cap B \\cap C)",
            "note": "Sum individual probabilities, subtract pairwise overlaps, and add back the central 3-way intersection."
        },
        {
            "type": "callout",
            "style": "info",
            "title": "Worked Example: Overlapping Card Draw",
            "text": "What is the probability of drawing a **King** ($K$) OR a **Heart** ($H$) from a standard 52-card deck?\n• $P(K) = \\frac{4}{52}$\n• $P(H) = \\frac{13}{52}$\n• $P(K \\cap H) = \\frac{1}{52}$ (King of Hearts is counted in both)\n$$P(K \\cup H) = \\frac{4}{52} + \\frac{13}{52} - \\frac{1}{52} = \\frac{16}{52} = \\frac{4}{13} \\approx 0.3077$$"
        },

        # -------------------------------------------------------------
        # 4. CONDITIONAL PROBABILITY & THE MULTIPLICATION RULE
        # -------------------------------------------------------------
        {
            "type": "heading",
            "level": "h2",
            "text": "4. Conditional Probability & The Multiplication Rule"
        },
        {
            "type": "paragraph",
            "text": "Conditional probability measures the likelihood of an event occurring given that another event has already occurred. The given condition serves as a **relative sample space**, collapsing our universe of consideration from $S$ to the conditioning set $B$."
        },
        {
            "type": "formula",
            "title": "Formal Definition of Conditional Probability",
            "formula": "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)} = \\frac{n(A \\cap B)}{n(B)}, \\qquad \\text{for } P(B) > 0",
            "note": "Read as: 'The probability of A given B is the probability of their intersection divided by the probability of B.'"
        },
        {
            "type": "callout",
            "style": "info",
            "title": "Verbal Translation & The Relative Sample Space Heuristic",
            "text": "• In $P(A \\mid B)$, the event **after the vertical bar** ($B$) is the **given condition** (already known or assumed to have occurred).\n• The denominator is always the condition: $P(B)$.\n• The numerator is the portion of the desired event $A$ that falls within the condition: $P(A \\cap B)$.\n• If a problem states *'Out of the female students...'* or *'Given that the board is from Supplier 1...'*, that group is your conditioning denominator!"
        },
        {
            "type": "formula",
            "title": "General Multiplication Rule (Joint Probability)",
            "formula": "P(A \\cap B) = P(B) \\cdot P(A \\mid B) = P(A) \\cdot P(B \\mid A)",
            "note": "Calculates the probability that BOTH event A AND event B occur together."
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Independent vs. Dependent Events"
        },
        {
            "type": "table",
            "title": "Independence vs. Dependence vs. Mutual Exclusivity",
            "headers": ["Relationship", "Mathematical Definition", "Key Formula", "Physical Interpretation"],
            "rows": [
                [
                    "Independent Events",
                    "Occurrence of $B$ has NO effect on the probability of $A$.",
                    "$P(A \\mid B) = P(A)$ and $P(A \\cap B) = P(A) \\cdot P(B)$",
                    "Sampling WITH replacement; rolling consecutive dice; flipping coins."
                ],
                [
                    "Dependent Events",
                    "Occurrence of $B$ alters the likelihood of $A$.",
                    "$P(A \\mid B) \\ne P(A)$ and $P(A \\cap B) = P(B) \\cdot P(A \\mid B)$",
                    "Sampling WITHOUT replacement (card draws, marbles from an urn)."
                ],
                [
                    "Mutually Exclusive Events",
                    "Events cannot co-occur; overlap is empty.",
                    "$P(A \\cap B) = 0$",
                    "A single trial cannot result in both (e.g. rolling 2 and rolling 5 on 1 die)."
                ]
            ]
        },
        {
            "type": "formula",
            "title": "Multiplication Rule for Independent Events",
            "formula": "P(A \\cap B) = P(A) \\cdot P(B) \\iff P(A \\mid B) = P(A)",
            "note": "For n independent events: P(E_1 \\cap E_2 \\cap \\dots \\cap E_n) = P(E_1) \\cdot P(E_2) \\cdots P(E_n)."
        },
        {
            "type": "callout",
            "style": "warning",
            "title": "CRITICAL EXAM TRAP: Mutually Exclusive vs. Independent",
            "text": "Students frequently confuse these two concepts:\n• **Mutually Exclusive** means they **CANNOT occur together**: $P(A \\cap B) = 0$.\n• **Independent** means they **DO NOT INFLUENCE each other**: $P(A \\cap B) = P(A)P(B)$.\n\n> [!CAUTION]\n> If two events $A$ and $B$ have non-zero probabilities ($P(A) > 0, P(B) > 0$), **THEY CAN NEVER BE BOTH MUTUALLY EXCLUSIVE AND INDEPENDENT**!\n> If $A$ and $B$ are mutually exclusive, knowing $A$ occurred guarantees $B$ did NOT occur ($P(B \\mid A) = 0 \\ne P(B)$), which means they are heavily **dependent**!"
        },

        # -------------------------------------------------------------
        # 5. THE LAW OF TOTAL PROBABILITY
        # -------------------------------------------------------------
        {
            "type": "heading",
            "level": "h2",
            "text": "5. The Law of Total Probability"
        },
        {
            "type": "paragraph",
            "text": "The Law of Total Probability is the fundamental bridge between simple partitions and complex composite events. If the sample space $S$ is divided into a collection of mutually exclusive and exhaustive partitions $B_1, B_2, \\dots, B_n$ (such that $\\bigcup_{i=1}^n B_i = S$ and $B_i \\cap B_j = \\emptyset$), then any event $A$ in $S$ is composed entirely of its disjoint intersections with each partition slice."
        },
        {
            "type": "formula",
            "title": "Law of Total Probability (Sum of Intersections)",
            "formula": "P(A) = P(A \\cap B_1) + P(A \\cap B_2) + \\dots + P(A \\cap B_n) = \\sum_{i=1}^n P(A \\cap B_i)",
            "note": "Valid whenever B_1, B_2, ..., B_n form a complete partition of sample space S."
        },
        {
            "type": "paragraph",
            "text": "Substituting the Multiplication Rule $P(A \\cap B_i) = P(A \\mid B_i) \\cdot P(B_i)$ into each term yields the practical, computational formulation of Total Probability:"
        },
        {
            "type": "formula",
            "title": "Law of Total Probability (Conditional Form)",
            "formula": "P(A) = \\sum_{i=1}^n [P(A \\mid B_i) \\cdot P(B_i)] = P(A \\mid B_1)P(B_1) + P(A \\mid B_2)P(B_2) + \\dots + P(A \\mid B_n)P(B_n)",
            "note": "Computes total probability by summing weighted conditional probabilities across all partitions."
        },
        {
            "type": "formula",
            "title": "Total Probability for Two Partitions (Event & Complement)",
            "formula": "P(A) = P(A \\mid B) \\cdot P(B) + P(A \\mid B') \\cdot P(B')",
            "note": "Most frequent exam form: partitioned by whether condition B occurred or did not occur."
        },
        {
            "type": "bullets",
            "items": [
                "**Tree Diagram Principle**: When analyzing multi-stage or partitioned probability problems, construct a probability tree diagram.",
                "**Primary Branches (Root)**: Represent the mutually exclusive partitions $B_1, B_2, \\dots, B_n$ labeled with their prior probabilities $P(B_i)$. The sum of all root branch probabilities must equal 1 ($P(B_1) + \\dots + P(B_n) = 1$).",
                "**Secondary Branches**: Stem from each partition and represent the conditional probabilities $P(A \\mid B_i)$ and $P(A' \\mid B_i)$. At each node, the conditional branches must sum to 1 ($P(A \\mid B_i) + P(A' \\mid B_i) = 1$).",
                "**Branch Multiplication**: Multiply probabilities along the path from root to leaf to obtain the joint intersection probability: $P(A \\cap B_i) = P(B_i) \\cdot P(A \\mid B_i)$.",
                "**Total Summation**: Add together all terminal path products that lead to the desired outcome $A$ to obtain $P(A)$."
            ]
        },

        # -------------------------------------------------------------
        # 6. BAYES' THEOREM (INVERSE PROBABILITY)
        # -------------------------------------------------------------
        {
            "type": "heading",
            "level": "h2",
            "text": "6. Bayes' Theorem (Inverse / Posterior Probability)"
        },
        {
            "type": "paragraph",
            "text": "Bayes' Theorem provides the mathematical formula for **inverting conditional probabilities**. It calculates the posterior probability of a cause or hypothesis $B_k$, given that the effect or test result $A$ has already been observed ($P(B_k \\mid A)$)."
        },
        {
            "type": "formula",
            "title": "Bayes' Theorem for Two Events",
            "formula": "P(B \\mid A) = \\frac{P(A \\cap B)}{P(A)} = \\frac{P(B) \\cdot P(A \\mid B)}{P(A)} = \\frac{P(B) \\cdot P(A \\mid B)}{P(A \\mid B)P(B) + P(A \\mid B')P(B')}",
            "note": "Derivation: Since P(A \\cap B) = P(B \\mid A)P(A) = P(A \\mid B)P(B), equate and solve for P(B \\mid A)."
        },
        {
            "type": "formula",
            "title": "Generalized Bayes' Theorem",
            "formula": "P(B_k \\mid A) = \\frac{P(B_k) \\cdot P(A \\mid B_k)}{\\sum_{i=1}^n [P(B_i) \\cdot P(A \\mid B_i)]} = \\frac{P(B_k \\cap A)}{P(A)}",
            "note": "Calculates the posterior probability of partition B_k given observed evidence A."
        },
        {
            "type": "table",
            "title": "The Four Structural Components of Bayes' Theorem",
            "headers": ["Component Term", "Mathematical Notation", "Meaning in Problem Context", "Example (Medical Diagnostic)"],
            "rows": [
                [
                    "Prior Probability",
                    "$P(B_k)$",
                    "The baseline probability of the partition or cause before any new test or evidence is observed.",
                    "Disease prevalence in population: $P(D) = 0.01$ (1%)."
                ],
                [
                    "Likelihood / Sensitivity",
                    "$P(A \\mid B_k)$",
                    "The probability that the evidence/test result occurs, given that cause $B_k$ is true.",
                    "Test sensitivity: $P(+ \\mid D) = 0.95$ (95% true positive rate)."
                ],
                [
                    "Marginal / Total Evidence",
                    "$P(A)$",
                    "The overall, unconditional probability of the observed evidence occurring across all possible causes.",
                    "Overall positive test rate across the whole population: $P(+) = 0.0394$."
                ],
                [
                    "Posterior Probability",
                    "$P(B_k \\mid A)$",
                    "The updated probability of the cause after taking the new test result/evidence into account.",
                    "Probability the person is actually sick given positive test: $P(D \\mid +) = 24.11\\%$."
                ]
            ]
        },

        # -------------------------------------------------------------
        # 7. STEP-BY-STEP WORKED REFERENCE EXAMPLES
        # -------------------------------------------------------------
        {
            "type": "heading",
            "level": "h2",
            "text": "7. Comprehensive Worked Reference Examples"
        },
        {
            "type": "paragraph",
            "text": "The following five problems represent the exact archetypes encountered in Finite Mathematics examinations, integrating the course curriculum guide directly with full mathematical solutions."
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Example 1: Abstract Partition Overlap Summation"
        },
        {
            "type": "paragraph",
            "text": "**Problem**: Suppose a sample space $S$ is partitioned into two mutually exclusive events, $B_1$ and $B_2$. A subset event $A$ overlaps with them such that the probability of its intersection with $B_1$ is $0.15$ and with $B_2$ is $0.35$. What is the total probability of event $A$?"
        },
        {
            "type": "bullets",
            "items": [
                "**Given**: $P(A \\cap B_1) = 0.15$, $P(A \\cap B_2) = 0.35$, and $B_1 \\cup B_2 = S$ with $B_1 \\cap B_2 = \\emptyset$.",
                "**Concept**: By the Law of Total Probability for a partitioned sample space, $P(A) = \\sum_{i=1}^n P(A \\cap B_i)$.",
                "**Calculation**: $$P(A) = P(A \\cap B_1) + P(A \\cap B_2) = 0.15 + 0.35 = 0.50$$",
                "**Conclusion**: The total probability of event $A$ is exactly **0.50** (or 50%)."
            ]
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Example 2: Two-Supplier Electronics Defect Rate"
        },
        {
            "type": "paragraph",
            "text": "**Problem**: An electronics manufacturer sources circuit boards from two suppliers: Supplier 1 ($B_1$) and Supplier 2 ($B_2$). Supplier 1 provides 70% of the boards ($P(B_1) = 0.70$) and Supplier 2 provides the remaining 30% ($P(B_2) = 0.30$). The defect rate for Supplier 1 is 4%, and for Supplier 2 it is 9%. Calculate the total probability that a randomly chosen board is defective."
        },
        {
            "type": "bullets",
            "items": [
                "**Variable Assignment**: Let $A$ be the event of a board being defective. Let $B_1$ = Supplier 1, $B_2$ = Supplier 2.",
                "**Identify Priors**: $P(B_1) = 0.70$, $P(B_2) = 0.30$ (Notice $0.70 + 0.30 = 1.00$).",
                "**Identify Conditionals**: 'Defect rate for Supplier 1 is 4%' translates directly to $P(A \\mid B_1) = 0.04$. Similarly, $P(A \\mid B_2) = 0.09$.",
                "**Apply Total Probability Formula**:\n$$P(A) = P(A \\mid B_1) \\cdot P(B_1) + P(A \\mid B_2) \\cdot P(B_2)$$\n$$P(A) = (0.04)(0.70) + (0.09)(0.30) = 0.028 + 0.027 = 0.055$$",
                "**Conclusion**: The overall probability of a randomly chosen board being defective is **0.055** (or **5.5%**)."
            ]
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Example 3: Three-Section University Course Pass Rate"
        },
        {
            "type": "paragraph",
            "text": "**Problem**: A university course has students split across three lecture sections: Section 1 holds 30%, Section 2 holds 50%, and Section 3 holds 20% of the students. The historical pass rates for each section are 0.80, 0.70, and 0.90 respectively. What is the overall pass rate for the entire course cohort?"
        },
        {
            "type": "bullets",
            "items": [
                "**Variable Assignment**: Let $A$ = passing the course. Let $B_1, B_2, B_3$ = enrolled in Sections 1, 2, and 3.",
                "**Priors**: $P(B_1) = 0.30$, $P(B_2) = 0.50$, $P(B_3) = 0.20$ (Sum: $0.30 + 0.50 + 0.20 = 1.00$).",
                "**Conditionals (Section Pass Rates)**: $P(A \\mid B_1) = 0.80$, $P(A \\mid B_2) = 0.70$, $P(A \\mid B_3) = 0.90$.",
                "**Weighted Sum Calculation**:\n$$P(A) = P(A \\mid B_1)P(B_1) + P(A \\mid B_2)P(B_2) + P(A \\mid B_3)P(B_3)$$\n$$P(A) = (0.80)(0.30) + (0.70)(0.50) + (0.90)(0.20)$$\n$$P(A) = 0.24 + 0.35 + 0.18 = 0.77$$",
                "**Conclusion**: The overall pass rate for the entire cohort is **0.77** (or **77%**)."
            ]
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Example 4: Medical Diagnostic Screening & The False Positive Paradox"
        },
        {
            "type": "paragraph",
            "text": "**Problem**: A medical condition affects 1% of a given population ($P(D) = 0.01$). A diagnostic test yields a positive result for an affected person with a probability of 0.95 ($P(+ \\mid D) = 0.95$). If the overall probability of any given person testing positive in the population is 0.0394 ($P(+) = 0.0394$), determine the probability that a person actually has the condition given that they tested positive."
        },
        {
            "type": "bullets",
            "items": [
                "**Identify Target Conditional**: We want $P(D \\mid +)$ — probability of having the disease **given** a positive test.",
                "**Identify Given Values**: Prior $P(D) = 0.01$, Sensitivity $P(+ \\mid D) = 0.95$, Total Positive Rate $P(+) = 0.0394$.",
                "**Apply Two-Event Bayes' Theorem**:\n$$P(D \\mid +) = \\frac{P(D) \\cdot P(+ \\mid D)}{P(+)}$$\n$$P(D \\mid +) = \\frac{(0.01)(0.95)}{0.0394} = \\frac{0.0095}{0.0394} \\approx 0.241117$$",
                "**Result**: $P(D \\mid +) \\approx \\mathbf{0.2411}$ (or **24.11%**).",
                "**Conceptual Insight (Why is it only 24.11%?)**: Despite the test having 95% sensitivity, the condition is rare (1% base rate). Most people (99%) are healthy. Even a modest 3% false positive rate among the healthy majority generates far more total false positives ($0.99 \\times 0.03 \\approx 0.0297$) than true positives ($0.01 \\times 0.95 = 0.0095$). Thus, out of all positive tests, roughly 1 in 4 actually has the condition!"
            ]
        },
        {
            "type": "heading",
            "level": "h3",
            "text": "Example 5: Three-Factory Widget Quality Control (Complete Bayes Analysis)"
        },
        {
            "type": "paragraph",
            "text": "**Problem**: Three factories supply widgets to a market: Factory 1 supplies 20% ($P(F_1) = 0.20$), Factory 2 supplies 50% ($P(F_2) = 0.50$), and Factory 3 supplies 30% ($P(F_3) = 0.30$). Their respective defect rates are 1% ($P(D \\mid F_1) = 0.01$), 3% ($P(D \\mid F_2) = 0.03$), and 2% ($P(D \\mid F_3) = 0.02$). If a randomly picked widget is inspected, determine:"
        },
        {
            "type": "table",
            "title": "Three-Factory Probability Distribution & Branch Joint Weights",
            "headers": ["Factory ($F_i$)", "Market Share $P(F_i)$", "Defect Rate $P(D \\mid F_i)$", "Joint Defective $P(F_i \\cap D)$", "Good Rate $P(D' \\mid F_i)$", "Joint Good $P(F_i \\cap D')$"],
            "rows": [
                ["Factory 1 ($F_1$)", "0.20", "0.01 (1%)", "$0.20 \\times 0.01 = 0.002$", "0.99 (99%)", "$0.20 \\times 0.99 = 0.198$"],
                ["Factory 2 ($F_2$)", "0.50", "0.03 (3%)", "$0.50 \\times 0.03 = 0.015$", "0.97 (97%)", "$0.50 \\times 0.97 = 0.485$"],
                ["Factory 3 ($F_3$)", "0.30", "0.02 (2%)", "$0.30 \\times 0.02 = 0.006$", "0.98 (98%)", "$0.30 \\times 0.98 = 0.294$"],
                ["**Total / Sum**", "**1.00**", "—", "**P(D) = 0.023**", "—", "**P(D') = 0.977**"]
            ]
        },
        {
            "type": "bullets",
            "items": [
                "**(a) If a widget is defective, what is the probability it originated from Factory 1?**\nApply Bayes' Theorem:\n$$P(F_1 \\mid D) = \\frac{P(F_1 \\cap D)}{P(D)} = \\frac{P(F_1)P(D \\mid F_1)}{P(D)} = \\frac{0.002}{0.023} = \\frac{2}{23} \\approx 0.08696 = \\mathbf{8.70\\%}$$",
                "**(b) What is the probability that a defective widget came from either Factory 2 or Factory 3?**\nSince factories are mutually exclusive:\n$$P(F_2 \\cup F_3 \\mid D) = P(F_2 \\mid D) + P(F_3 \\mid D) = \\frac{P(F_2 \\cap D) + P(F_3 \\cap D)}{P(D)} = \\frac{0.015 + 0.006}{0.023} = \\frac{0.021}{0.023} = \\frac{21}{23} \\approx \\mathbf{91.30\\%}$$\n*Alternative Complement Method*: $P(F_2 \\cup F_3 \\mid D) = 1 - P(F_1 \\mid D) = 1 - \\frac{2}{23} = \\frac{21}{23} \\approx 91.30\\%$.",
                "**(c) If a widget is NOT defective, what is the probability it originated from Factory 3?**\nTotal good probability $P(D') = 1 - P(D) = 1 - 0.023 = 0.977$.\nGood rate for Factory 3 is $P(D' \\mid F_3) = 1 - 0.02 = 0.98$.\n$$P(F_3 \\mid D') = \\frac{P(F_3 \\cap D')}{P(D')} = \\frac{P(F_3)P(D' \\mid F_3)}{P(D')} = \\frac{0.30 \\times 0.98}{0.977} = \\frac{0.294}{0.977} \\approx 0.30092 = \\mathbf{30.09\\%}$$"
            ]
        },

        # -------------------------------------------------------------
        # 8. MASTER EXAM DIAGNOSTIC DECISION MATRIX
        # -------------------------------------------------------------
        {
            "type": "heading",
            "level": "h2",
            "text": "8. Master Exam Diagnostic Decision Matrix"
        },
        {
            "type": "table",
            "title": "How to Instantly Classify Probability Exam Problems",
            "headers": ["Question Trigger / Keywords", "Target Probability", "Governing Law / Rule", "Standard Operational Formula"],
            "rows": [
                [
                    "'...or...', 'at least one of A or B'",
                    "$P(A \\cup B)$",
                    "General Addition Rule",
                    "$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$"
                ],
                [
                    "'...mutually exclusive...', 'disjoint'",
                    "$P(A \\cup B)$",
                    "Disjoint Addition Rule",
                    "$P(A \\cup B) = P(A) + P(B)$"
                ],
                [
                    "'...at least one success in n trials...'",
                    "$P(\\text{at least 1})$",
                    "Complement Shortcut",
                    "$P(\\text{at least 1}) = 1 - P(\\text{None}) = 1 - [P(\\text{failure})]^n$"
                ],
                [
                    "'Given that...', 'Knowing that...', 'Of those who...'",
                    "$P(A \\mid B)$",
                    "Conditional Definition",
                    "$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$"
                ],
                [
                    "'...and...', 'both occur sequentially / together'",
                    "$P(A \\cap B)$",
                    "General Multiplication Rule",
                    "$P(A \\cap B) = P(B) \\cdot P(A \\mid B)$"
                ],
                [
                    "'...independent events...'",
                    "$P(A \\cap B)$",
                    "Independent Product Rule",
                    "$P(A \\cap B) = P(A) \\cdot P(B)$"
                ],
                [
                    "'What is the overall / total probability of A?'",
                    "$P(A)$",
                    "Law of Total Probability",
                    "$P(A) = \\sum [P(A \\mid B_i) \\cdot P(B_i)]$"
                ],
                [
                    "'Given outcome A, what is the probability it came from cause B_k?'",
                    "$P(B_k \\mid A)$",
                    "Bayes' Theorem",
                    "$P(B_k \\mid A) = \\frac{P(B_k)P(A \\mid B_k)}{\\sum P(B_i)P(A \\mid B_i)}$"
                ]
            ]
        },
        {
            "type": "callout",
            "style": "warning",
            "title": "The Top 5 Traps on Probability Exams",
            "text": "1. **Transposed Conditional / Inverse Fallacy**: Never assume $P(A \\mid B) = P(B \\mid A)$. The probability that an animal has 4 legs given it is a dog is $100\\%$, but the probability that an animal is a dog given it has 4 legs is far less!\n2. **Double Counting the Overlap**: In questions with 'OR', always ask: *Can an outcome satisfy both conditions at once?* If yes, you must subtract $P(A \\cap B)$.\n3. **Independent vs. Disjoint Confusion**: Mutually exclusive events are NEVER independent unless one has probability 0.\n4. **With vs. Without Replacement**: If items are drawn without replacement, both the numerator and the denominator of subsequent probabilities decrease by 1.\n5. **Denominators in Bayes' Theorem**: When applying Bayes' Theorem, always calculate the denominator $P(A)$ first using the Law of Total Probability to ensure arithmetic accuracy before dividing."
        }
    ]

    reviewer = {
        "id": "reviewer_summative_test_2_finite_math",
        "subject": "Finite Math",
        "tag": "Elective",
        "color": "border-l-4 border-purple-500",
        "title": "Summative Test 2 - Finite Math Reviewer: Probability",
        "summary": "Comprehensive, high-yield exam reviewer covering Introduction to Probability (Sample Spaces, Axioms, Addition Rules, Complements), Conditional Probability, Independence, Law of Total Probability, and Bayes' Theorem with fully worked step-by-step problems.",
        "blocks": blocks
    }

    return reviewer

def apply_reviewer():
    new_rev = generate_reviewer()
    targets = [
        "updates.json",
        "Content Studio/updates.json",
        "Content Studio/src/updates.json"
    ]

    for target_path in targets:
        if not os.path.exists(target_path):
            print(f"Skipping non-existent {target_path}")
            continue

        with open(target_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        reviewers = data.get("stemReviewers", [])
        
        # Check if already present, update or append
        existing_idx = None
        for i, r in enumerate(reviewers):
            if r.get("id") == new_rev["id"]:
                existing_idx = i
                break

        if existing_idx is not None:
            reviewers[existing_idx] = new_rev
            print(f"Updated existing {new_rev['id']} in {target_path}")
        else:
            # Place right after reviewer_summative_test_1_finite_math if present
            insert_pos = len(reviewers)
            for i, r in enumerate(reviewers):
                if r.get("id") == "reviewer_summative_test_1_finite_math":
                    insert_pos = i + 1
                    break
            reviewers.insert(insert_pos, new_rev)
            print(f"Inserted new {new_rev['id']} at index {insert_pos} in {target_path}")

        data["stemReviewers"] = reviewers
        data["updatedAt"] = "2026-10-27T09:15:00.000Z"
        data["announcement"] = "Added Summative Test 2 Finite Math Reviewer: Probability & Bayes' Theorem."

        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")

        print(f"Successfully saved {target_path}")

if __name__ == "__main__":
    apply_reviewer()
