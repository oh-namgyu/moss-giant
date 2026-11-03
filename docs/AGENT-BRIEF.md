# Directing an agent to make one

This is the process behind the film, written so you can reuse it with any coding agent that can run commands and view images.

## The core idea

An agent cannot make good pictures blind. **What matters most is that it can see its own output.** Everything below exists to give it that loop: render, look, list what is wrong, fix, repeat.

## A brief you can copy

Replace the scene and hand this over.

```text
Make a 10-second 2D animation using only code: an HTML canvas page with no image, video
or audio files and no generative media models.

SCENE: <your scene, as concrete beats with rough timings>

Build it the way an animation studio would:
- Painted background plates, built from thousands of small brush marks in a few tones,
  merged with a Kuwahara filter. Move them at different speeds for parallax.
- A cel-shaded character on one jointed rig, so it stays on model in every shot: flat
  colour, hard-edged shadows from the light direction, ink lines that vary in weight
  and wobble slightly between drawings.
- Drawings change 12 times a second while the camera moves 24 times a second.
- Anticipation before big moves. Camera shake on impacts. Cel-shaded smoke.

Make everything deterministic: frame(i) must give the same picture whatever was drawn
before it. Use seeded randomness, and compute particle positions from time.

Work in this order, and do not move on until the current step looks right:
1. Background plates. Render a still and look at it.
2. The character in its main pose, wide and close up. Look at both.
3. Effects and the full timeline. Render a contact sheet of 16 to 24 frames and look.
4. Sound, a player page, and an MP4 render.

After every render, view the image and write down what is wrong before changing code.
Be specific: "the head is hidden behind the shoulder" is useful, "improve quality" is not.
Then compare against a reference frame if you have one, and fix the biggest gaps.
Finally, measure what you cannot see: frame-to-frame differences to find glitches, and
audio peak levels to find clipping. Tell me what you could not verify.
```

## What each pass actually caught

This is the real sequence from making this film. Note how little of it was about code quality, and how much was about looking.

| Pass | What looking at the frames revealed | Fix |
|---|---|---|
| Plates, first render | Thin vertical lines from a filter bug. Conifers like stacked plates. Clouds like petals | Fixed the filter, rebuilt trees and clouds |
| Character, first render | **The face was completely hidden behind the shoulder.** The body read as rounded blocks, not a kneeling giant | Moved the joints, enlarged the head, sharpened the shapes, redesigned the pose |
| First full contact sheet | Washed out by too much light. The source of the light rays was visible on screen. The exhaust trail looked like a laser | Cut the bloom and rays, started the rays at the sun, added a smoke trail |
| Full render | Every frame was smaller than the canvas | A bug in the capture tool, not the film: the player was overwriting the capture settings |
| Side by side with a reference | Too little overgrowth, and no depth in the foreground | More moss and vines, dark foreground grass |
| Final check | Tree crowns floating in the air | Rebuilt the crowns to reach the ground |
| Writing tests for publication | **The first frame after loading differed from every later render**, a real bug that visual review had missed | Set image smoothing before the first draw |

## Habits that paid off

- **Contact sheets over video.** Twenty-four frames on one image shows composition, pacing and continuity in a single look. `npm run sheet` makes one.
- **Hash frames before refactoring.** This code was reorganised from about 400 dense lines into about 3,900 readable ones. Comparing frame hashes before and after proved that no pixel changed.
- **Test your claims, not your code.** The tests check what the README promises: no embedded media, repeatable pictures, sound that does not clip.
- **Keep it honest.** Ask the agent to report what it could not verify. Here, that was how the sound actually sounds.

## Where a person still matters

The agent can judge whether a frame matches a description, but taste comes from you. The most useful interventions are specific reactions to what you see, and deciding when it is good enough. Listen to the sound yourself, because the agent cannot.
