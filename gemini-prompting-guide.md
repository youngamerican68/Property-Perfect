# Gemini 2.5 Flash Image Prompting Guide

Based on Google's official documentation and best practices for image generation and editing with Gemini 2.5 Flash Image.

## Key Principles

### Think Like a Photographer
- Use photographic terminology and concepts
- Describe lighting, composition, and mood naturally
- Focus on the desired visual outcome rather than step-by-step instructions

### Lighting Prompts
Instead of imperative commands like "change the lighting to evening", use descriptive photographic language:

**Good Examples:**
- "relight this scene with warm golden hour sunlight streaming through windows, creating soft amber shadows and a cozy atmosphere"
- "relight this scene with bright natural daylight flooding the space, eliminating dark areas and creating a crisp, vibrant atmosphere"
- "relight this scene with warm interior lighting from multiple lamps and fixtures, creating an intimate cozy evening atmosphere"

**Avoid:**
- Step-numbered instructions ("Step 1: Change lighting, Step 2: Add furniture")
- Imperative commands ("Make this brighter", "Change to evening lighting")
- Technical AI instructions ("FIRST do this, THEN do that")

### Natural Language Flow
- Combine multiple requests into one cohesive description
- Use conversational, natural language
- Describe the scene you want to achieve, not the process to get there

### Specific Techniques for Property Photos
- Focus on atmosphere and mood creation
- Use real estate photography terminology
- Emphasize warmth, brightness, and appeal for potential buyers
- Describe lighting conditions as they would naturally occur

## Example Transformations

**Before (Step-based):**
```
Step 1: Change lighting to evening
Step 2: Remove clutter
Step 3: Add custom instruction
```

**After (Photographic):**
```
relight this scene with warm interior lighting from multiple lamps and fixtures, creating an intimate cozy evening atmosphere, while removing all clutter and personal items to create a clean, staged appearance for real estate photography
```

## Model Behavior Notes
- Gemini 2.5 Flash Image responds better to descriptive requests than instructional commands
- The model tends to ignore step-numbered approaches
- Natural language that describes the desired end result works best
- Photographic terminology helps the model understand lighting and composition goals