---
name: Mystic Birth Chart Instagram Carousel Generator
description: Triggers when the user asks to generate an Instagram carousel, post, or social media content for Mystic Birth Chart.
---

# Mystic Birth Chart - Instagram Carousel Generation Skill

When the user asks you to create a carousel or post, follow this exact procedure to maintain absolute aesthetic and tonal consistency.

## 1. The Strategy (Structure)
A carousel should have 5 to 7 slides.
- **Slide 1 (Cover):** A strong, curiosity-inducing hook about traditional astrology.
- **Slides 2 to N-1 (Body):** Dense but easy-to-read explanations. Break down complex Hermetic/Traditional concepts.
- **Last Slide (CTA):** Always end with a Call to Action directing the user to the Free Chart Calculator or the Premium Readings at `mysticbirthchart.com`.

## 2. The Copywriting Tone
- **Voice:** Authoritative, academic, sober, and slightly esoteric.
- **Rules:** NEVER use modern psychological astrology terms (e.g., "inner child", "evolution", "vibe", "energy shift"). Focus on classical Hellenistic mechanics (dignity, sect, fate, bounds, planetary hours).
- **Language:** ALWAYS English. The target audience is US/UK. Even if the user asks in Portuguese, the final carousel text and image prompt text MUST be in English.

## 3. Image Generation (The Aesthetic)
You must use the `generate_image` tool to create a unique slide for each part of the carousel.
- **Crucial Instruction:** You MUST include the exact text of the slide in your prompt so the AI draws the text on the image. Do NOT tell the AI to avoid text.
- **Base Prompt (Always use this as a foundation):**
  *"A sleek, premium Instagram post for a traditional astrology page. Dark parchment background with subtle geometric borders in elegant gold. Aesthetic is dark academia, occult, Hermetic, clean, minimalist, high-end. In the center, clearly write the text: '[INSERT EXACT TEXT HERE]' in an elegant, legible serif font. Below the text, include a minimalist golden [INSERT RELEVANT SYMBOL/ICON]."*

## 4. Final Delivery (The Artifact)
Present the final result to the user as a Markdown Artifact. Use the special `carousel` markdown block to present the slides beautifully in the IDE.

**Format Example:**
````carousel
![Slide 1 Background](/absolute/path/to/generated_slide1.png)

### Slide 1: [Hook Text]
(Text that the user will copy and paste over the image in Canva)

<!-- slide -->
![Slide 2 Background](/absolute/path/to/generated_slide2.png)

### Slide 2: [Body Text]
(Explanation text)

<!-- slide -->
![Slide 3 Background](/absolute/path/to/generated_slide3.png)

### Slide N: [CTA Text]
Map your true architecture today. Link in bio.
````

**Caption:** Below the carousel block, provide the Instagram Post Caption (the text that goes in the description of the post) along with relevant hashtags (e.g., #traditionalastrology #hermeticism).
