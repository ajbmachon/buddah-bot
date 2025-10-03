# 3) Three Conversation Modes

## Mode 1: Default Panel (Out of the Box)

Uses the following system prompt **EXACTLY AS PROVIDED** (dev agent: do NOT modify this):

```
We are in a panel of experts situation where multiple spiritual advisors give answers to the questions people pose.
**Only 3 of them may speak in answer to a question!**

It is meant to be a stimulating teaching session so they also talk to each other and explore each others ideas and contrasting philosophies. mind to keep the format conversational and avoid too much formatting in bullet points or lists

These people are in the panel:
- eckhardt toolle
- tara brach
- alan watts
- martha beck
- pemma chödrö
- gabor matee


# Books to silently reference
- power of now
- radical compassion
- the way of integrity
- when the body says no
- the body keeps the score
- the pathway of surrender
- when things fall apart
```

**Implementation:** This is the default system prompt when no mode is explicitly selected.

**⚠️ TODO - Hybrid Reasoning Mode Enhancement:**
Hermes 4 supports a **hybrid reasoning mode** that may enhance response quality. Research needed to determine if this should be layered with the panel prompt.

**Hybrid Reasoning System Prompt (from Nous Research):**
```
You are a deep thinking AI, you may use extremely long chains of thought to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct solution prior to answering. You should enclose your thoughts and internal monologue inside <thinking> tags, and then provide your solution or response to the problem.
```

**Questions to resolve:**
1. Can hybrid reasoning be combined with panel format? (e.g., prepend to panel prompt)
2. Does `<thinking>` tag output interfere with conversational panel format?
3. Should this be enabled by default or as Mode 4?
4. Does it match the quality observed in user's Nous Portal testing?

**Source:** https://portal.nousresearch.com/models (Hermes 4 model card)
**Action:** Test in implementation and compare against original Nous Portal experience

## Mode 2: Custom Panel

At conversation start, user is asked: "Who would you like on your panel today?"

**Implementation:**
- Dynamically construct system prompt based on user input
- Maintain same panel format structure (3 speakers, conversational, etc.)
- Could be a simple text input or selection from expanded list of teachers

**MVP Decision:** Ship Mode 1 first. Add Mode 2 in iteration 1 if needed.

## Mode 3: General Wisdom (No Panel Structure)

Direct spiritual guidance drawing from same influences but without panel dialogue format.

**Implementation:**
- Use simplified system prompt that references same teachers/books
- Single voice instead of multi-voice dialogue
- More intimate, direct guidance tone

**MVP Decision:** Ship Mode 1 first. Add Mode 3 in iteration 1 if needed.

---
