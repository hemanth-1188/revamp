# PROJECT: AI-POWERED FASHION DESIGN, GARMENT RECOMMENDATION & 3D VIRTUAL CUSTOMIZATION

## ROLE

Act as a senior fashion technology engineer, AI engineer, 3D graphics developer and full-stack architect with 10+ years of experience.

I have an existing fashion tailoring marketplace application.

I want to upgrade TWO existing features together:

1. Suitable Garment Ideas for This Fabric – Realistic AI garment recommendations.
2. 3D Fashion Mannequin Studio – Realistic garment fitting and fabric customization.

Both features must work together as one integrated fashion design experience.

IMPORTANT:
Do not create a new application.
Do not rebuild my existing project.
Inspect the existing codebase and upgrade the current implementation while preserving all existing functionality.

# PART 1: REALISTIC AI GARMENT RECOMMENDATIONS

## 1. OBJECTIVE

Currently, my page titled "Suitable Garment Ideas for This Fabric" displays flat, illustration-style garment images.

Replace these illustrations with realistic, photorealistic garment previews.

When users upload fabric, the application should recommend garment designs that look like actual stitched clothing made using the uploaded fabric.

## 2. REALISTIC GARMENT GENERATION

Generate or retrieve realistic garment previews for:

WOMEN'S COLLECTION:

* A-line Kurti
* Straight-cut Kurti
* Anarkali Kurti
* Short Kurti
* Long Kurti
* Shirt-style Kurti
* Flared Kurti
* Blouse
* Gown
* Other existing categories.

MEN'S COLLECTION:

* Shirt
* T-shirt
* Kurta
* Jacket
* Traditional wear
* Other existing categories.

Each garment should have its own realistic shape and silhouette.

Do not reuse one image for every recommendation.

## 3. FABRIC ACCURACY

The user's uploaded fabric must be the primary reference for garment generation.

Preserve:

* Original fabric colour.
* Original fabric pattern.
* Printed designs.
* Embroidery details.
* Texture.
* Pattern scale.
* Overall visual appearance.

Apply realistic fabric folds, shadows and draping.

Do not randomly change the uploaded fabric into a different material.

If exact fabric preservation cannot be guaranteed, clearly treat the output as an AI-generated approximation.

## 4. GARMENT RECOMMENDATION CARDS

Upgrade the existing recommendation cards.

Each card should display:

* Large realistic garment preview.
* Garment name.
* Garment category.
* Silhouette.
* Estimated fabric requirement.
* Fabric compatibility.
* Match score based on actual recommendation logic.
* Favourite button.
* View details button.
* Customize button.

Maintain existing:

* Category filters.
* Sorting.
* Colour filters.
* Pattern filters.
* Silhouette filters.
* Favourite functionality.
* Recommendation logic.

Do not display an arbitrary 99% match score for every garment.

## 5. GARMENT DETAIL VIEW

When a user selects a garment, display:

* Large front preview.
* Back preview, when available.
* Side preview, when available.
* Fabric details.
* Garment specifications.
* Estimated fabric requirement.
* Design description.

Include two important actions:

1. CUSTOMIZE IN 3D
2. TRY ON ME

# PART 2: REALISTIC 3D FASHION MANNEQUIN

## 6. UNIVERSAL MANNEQUIN

Use my existing ONE universal mannequin.

Do not create separate male and female mannequins.

The same mannequin must remain visible when switching between men's and women's clothing collections.

Support:

* 360-degree rotation.
* Zoom in and zoom out.
* Front view.
* Back view.
* Side view.

## 7. FIX EXISTING GARMENT GEOMETRY

Currently, my 3D garment appears like a cylindrical wireframe cage around the mannequin.

Fix this completely.

Do not use:

* Cylindrical wireframes.
* Basic geometric shapes as final garments.
* Flat planes surrounding the mannequin.
* Unfitted meshes.
* Random vertical lines.

Instead, use actual garment geometry.

Garment meshes must follow:

* Shoulder contours.
* Chest shape.
* Waist measurements.
* Hip contours.
* Arm positions.
* Leg proportions.
* Garment-specific dimensions.

Each garment must fit the mannequin naturally.

## 8. ACTUAL GARMENT MODELS

Create or integrate separate 3D garment meshes for:

* Shirt.
* T-shirt.
* Kurti.
* Short Kurti.
* A-line Kurti.
* Straight Kurti.
* Blouse.
* Dress.
* Gown.
* Trousers.

Each garment must have appropriate geometry.

A shirt must look like a shirt.

A kurti must have the correct neckline, sleeves, body shape and length.

A gown must have appropriate upper-body fitting and lower-body draping.

Do not use one generic mesh for every clothing category.

Use properly modelled GLB/GLTF garment assets.

## 9. REALISTIC GARMENT FITTING

Implement appropriate garment-to-body fitting.

Use:

* Correct mesh topology.
* Vertex positioning.
* Garment measurements.
* Body alignment.
* Skinning where appropriate.
* Collision detection.
* Natural garment spacing.

Avoid:

* Garments floating outside the mannequin.
* Garments passing through the body.
* Incorrect shoulder alignment.
* Unnatural sleeve positions.
* Excessive gaps around the waist.

For the initial implementation, use properly fitted static garment meshes.

Add skeletal deformation or cloth simulation only where technically appropriate.

## 10. FABRIC TEXTURE MAPPING

This is one of the most important requirements.

When the user uploads fabric, apply its texture to the selected 3D garment.

Use proper UV mapping.

Requirements:

* Preserve original fabric patterns.
* Maintain correct texture scale.
* Support texture rotation.
* Support texture tiling.
* Allow colour customization.
* Maintain high-resolution texture quality.
* Support different fabric appearances.

The uploaded fabric must appear ONLY on the garment.

Never apply the fabric texture to the mannequin's skin.

Do not stretch the fabric texture unnaturally.

Use appropriate physically based materials.

## 11. REALISTIC CLOTH APPEARANCE

Improve the garment rendering.

Include:

* Natural folds.
* Realistic fabric thickness.
* Smooth surfaces.
* Natural draping.
* Proper stitching details.
* Realistic lighting.
* Soft shadows.
* Appropriate fabric materials.

Remove all unwanted wireframe rendering.

Check geometry indices, face normals, materials and duplicate meshes.

The final garment should look like real clothing worn by the mannequin.

# PART 3: CONNECT BOTH FEATURES

## 12. RECOMMENDATION-TO-3D WORKFLOW

Both modules must share the same garment design data.

Implement this workflow:

USER UPLOADS FABRIC
|
v
FABRIC ANALYSIS
|
v
AI GARMENT RECOMMENDATIONS
|
v
USER SELECTS GARMENT
|
v
GARMENT DETAIL PREVIEW
|
v
CUSTOMIZE IN 3D
|
v
LOAD SELECTED GARMENT ON
EXISTING UNIVERSAL MANNEQUIN
|
v
APPLY UPLOADED FABRIC TEXTURE
|
v
CUSTOMIZE COLOUR AND DESIGN
|
v
SAVE FINAL DESIGN
|
v
TRY ON ME
|
v
CONNECT WITH TAILOR

IMPORTANT:

When a user selects a recommended garment and clicks "Customize in 3D", load the corresponding 3D garment model.

Do not open an unrelated garment.

Maintain the selected garment category, fabric image, texture settings and design configuration when navigating between pages.

## 13. SAVE AND SHARE DESIGN

Allow users to:

* Save customized designs.
* View saved designs.
* Download previews.
* Share designs with tailors.
* Reopen previously saved designs.
* Continue customization.

Store appropriate design information using my existing database and authentication system.

# PART 4: AI VIRTUAL TRY-ON INTEGRATION

## 14. CONNECT TO FASHN VTON

Prepare the selected garment for the existing AI Virtual Try-On integration.

Use FASHN VTON v1.5:

https://github.com/fashn-AI/fashn-vton-1.5

Workflow:

USER PHOTO
+
SELECTED GARMENT IMAGE
|
v
FASHN VTON
|
v
GENERATED TRY-ON IMAGE

The garment selected from the recommendation page should be the same garment sent to the virtual try-on module.

For 3D garments, generate a suitable garment product image using an appropriate rendering process before sending it to the model.

Do not send a raw fabric photograph directly as if it were a finished garment.

Respect the actual categories supported by the model.

# PART 5: TECHNICAL REQUIREMENTS

## 15. TECHNOLOGY

Inspect and reuse my existing technology stack.

For 3D rendering, use:

* Three.js.
* React Three Fiber.
* Drei.
* GLB/GLTF models.
* MeshStandardMaterial or MeshPhysicalMaterial.
* Proper UV mapping.

For AI integration, use:

* FASHN VTON v1.5.
* Python.
* FastAPI.
* PyTorch.

Do not unnecessarily replace my existing frontend, backend, database or authentication.

## 16. PERFORMANCE

* Optimize 3D models.
* Use compressed GLB assets where appropriate.
* Lazy-load garment models.
* Cache generated previews.
* Optimize texture resolution.
* Avoid unnecessary rerendering.
* Implement proper loading states.
* Maintain responsive mobile and desktop layouts.

## 17. UI/UX

Maintain my existing application's design language.

Improve the experience with:

* Premium fashion catalogue presentation.
* Realistic garment previews.
* Clean garment customization panels.
* Interactive 3D viewer.
* Smooth transitions.
* Responsive layouts.
* Clear action buttons.

Do not unnecessarily redesign unrelated pages.

# PART 6: IMPLEMENTATION AND TESTING

## 18. INSPECT BEFORE CODING

First inspect:

1. Existing recommendation page.
2. Existing fabric upload functionality.
3. Existing garment recommendation algorithm.
4. Existing 3D mannequin component.
5. Existing garment geometry.
6. Existing texture mapping.
7. Existing database.
8. Existing authentication.
9. Existing image storage.
10. Existing virtual try-on integration, if present.

Identify the exact files that need modification.

## 19. IMPLEMENTATION PHASES

Phase 1:
Fix the existing 3D wireframe garment problem.

Phase 2:
Create or integrate realistic garment meshes.

Phase 3:
Implement proper garment-to-mannequin fitting.

Phase 4:
Implement fabric UV texture mapping.

Phase 5:
Upgrade the garment recommendation cards with realistic previews.

Phase 6:
Connect recommended garments to the 3D mannequin.

Phase 7:
Integrate saved designs and tailor sharing.

Phase 8:
Connect selected garment previews to AI Virtual Try-On.

Phase 9:
Test the complete workflow.

## 20. STRICT RULES

* Do not rebuild my application.
* Do not remove existing features.
* Do not replace my universal mannequin.
* Do not use fake 3D garments.
* Do not use cylindrical wireframe meshes.
* Do not apply fabric textures to the entire mannequin.
* Do not display fake AI-generated results.
* Do not hardcode arbitrary recommendation scores.
* Do not break existing dashboards or payments.
* Do not use paid APIs without my permission.

If suitable garment assets are missing, identify the missing assets and implement a reusable garment asset-loading system.

Do not claim that cloth simulation, exact fabric preservation or unsupported garment categories work unless they have been tested.

## FINAL EXPECTATION

I want a professional AI-powered fashion design platform.

The user should be able to:

1. Upload a fabric photograph.
2. Receive realistic garment recommendations using that fabric.
3. Select a garment design.
4. Open that exact garment in the 3D customization studio.
5. See the garment properly fitted to the existing universal mannequin.
6. Apply the uploaded fabric texture.
7. Customize the garment.
8. Preview the garment from all angles.
9. Try the design on their own photograph using AI.
10. Save the final design.
11. Connect with a tailor.
12. Complete the existing booking and payment workflow.

Both features must work together seamlessly.

Prioritize actual functionality, realistic garment geometry and accurate fabric visualization over decorative UI changes.

Test the entire workflow before declaring the implementation complete.
