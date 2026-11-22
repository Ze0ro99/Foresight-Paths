# PiNet and Pi Sign-in Portal Configuration

Project: Foresight Paths Observatory  
Repository: `Ze0ro99/Foresight-Paths`  
Production URL supplied by the developer: `https://foresight-paths-observatory.vercel.app`

## PiNet

- **Fullscreen supported:** Select **Yes** only after confirming the deployed app is responsive across phone, tablet, and desktop widths, with no horizontal overflow and usable navigation/forms. This repository has not yet been runtime-tested across those viewport sizes, so this is a verification gate—not a confirmed capability.
- **Metadata Support Type:** The portal's exact dropdown choices were not supplied. Choose the option matching metadata the app actually emits. Pi payment metadata is a developer-defined JSON object used to associate payments with internal records; it is not a PiNet preview/social-card setting. Do not select a payment metadata type unless the app sends and handles that object. Confirm the exact PiNet dropdown choices before recording a selection.
- **PiNet eligibility:** Pi documentation says the app must be listed in the Mainnet Ecosystem before registering a PiNet subdomain. The PiNet subdomain must be under the verified app domain; the portal adds a numeric suffix. PiNet browsing does not itself grant Pi authentication/payment capability.

## Pi Sign-in / OAuth

Values supplied by the developer:

- **OAuth Client ID:** `wCmyjC-SqHyPUGy6egLY5qRdFZiRo2FLd7sgNrXerX4`
- **Registered redirect URI supplied:** `https://foresight-paths-observatory.vercel.app`
- **Supported flow:** OAuth implicit flow only, per the portal notice. No client secret is issued for this flow.

Implementation and validation notes:

1. The redirect URI must exactly match one registered in the portal, including path and trailing slash.
2. Keep the root redirect URI only if the application actually handles the OAuth callback fragment at `/`. Otherwise register the exact callback path implemented by the app (for example, `/signin/callback`) and use that same URI in the sign-in request.
3. Generate and store a fresh random `state` before redirecting; verify the returned `state` before accepting any token.
4. Read the implicit-flow token from the URL fragment in frontend JavaScript, call Pi's `/v2/me` endpoint with it, then remove the fragment from browser history. Do not log or persist the bearer token unnecessarily.
5. The client ID is public configuration. Never place a server API key, wallet private key, or other secret in frontend code or this document.

## Before selecting the portal options

- Verify responsive layout at narrow mobile, tablet, and desktop widths.
- Confirm the exact PiNet **Metadata Support Type** choices shown in the portal and match one to implemented behavior.
- Confirm the app domain is verified and the registered OAuth redirect URI is an implemented callback.
- Test sign-in and state validation in the Pi Browser and ordinary browser as applicable.

## Official references

- PiNet: https://developers.minepi.com/docs/build-first-app/PiNet
- Pi Sign-in: https://developers.minepi.com/docs/use-native-features/PiSignIn
- Metadata Support Type: https://developers.minepi.com/docs/accept-payment/MetadataSupportType
