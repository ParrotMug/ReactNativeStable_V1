# replit.md

## Overview

This is a chemistry learning mobile application built with Expo/React Native. The app provides interactive quiz modes for studying organic chemistry topics including synthesis reactions, named reactions, IUPAC nomenclature, stereochemistry, functional groups, and reagents. The app renders molecular structures using RDKit (a cheminformatics library) via WebView integration, allowing users to visualize chemical compounds represented in SMILES notation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81
- **Routing**: Expo Router with file-based routing (`app/` directory)
- **UI Components**: Mix of custom components and themed components with light/dark mode support
- **Animations**: React Native Reanimated for smooth animations
- **Styling**: StyleSheet-based styling with LinearGradient for visual effects

### Quiz System Design
The app implements three distinct quiz modes:
1. **Sandbox Mode** (`app/sandbox.tsx`): Infinite practice with question shuffling
2. **Blitz Mode** (`app/blitz.tsx`): 60-second timed challenge with combo scoring system
3. **Exam Mode** (`app/exam.tsx`): 20-question assessment with grade calculation (German grading scale 1.0-5.0)

### Molecule Rendering System
- **ChemieEngine** (`components/ChemieEngine.tsx`): Singleton WebView that loads RDKit library once and handles all rendering requests via a queue system
- **RDKitRenderer** (`components/RDKitRenderer.tsx`): Component that displays SVG molecules, supports both cached and live rendering
- **useMoleculePreloader** (`hooks/useMoleculePreloader.ts`): Custom hook that pre-renders molecules in batches for performance optimization

The molecule rendering uses a request/response pattern where:
1. SMILES strings are sent to the hidden ChemieEngine WebView
2. RDKit converts SMILES to SVG
3. SVG is cached and returned to requesting components

### Data Architecture
- Question data stored as JSON files in `assets/data/`
- Topics: synthesis, named reactions, IUPAC, stereochemistry, functional groups, reagents
- Universal mode combines all topics dynamically
- Each question contains SMILES notation, options, correct answer, and explanations

### Navigation Structure
- Tab-based navigation for main screens (Home, Explore)
- Stack navigation for quiz flows
- Practice screen acts as topic/mode selector before launching quiz

## External Dependencies

### Backend Services
- **Supabase**: Backend-as-a-Service for authentication and data storage
  - Configured in `lib/supabase.ts`
  - Currently set with `persistSession: false` (sessions not persisted across app restarts)
  - Uses Supabase JavaScript client v2.39.7

### Chemistry Libraries
- **RDKit**: Loaded via CDN (`https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js`)
  - Converts SMILES molecular notation to SVG images
  - Runs inside WebView for cross-platform compatibility

### Key NPM Dependencies
- `react-native-webview`: Required for RDKit integration
- `expo-linear-gradient`: Visual effects for UI
- `expo-haptics`: Tactile feedback on iOS
- `react-native-reanimated`: Animation library
- `react-native-url-polyfill`: Required for Supabase compatibility