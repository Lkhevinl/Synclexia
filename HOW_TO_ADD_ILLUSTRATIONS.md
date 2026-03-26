# How to Add Custom Illustrations

This guide explains where to add your custom illustration images.

## Step 1: Add Your Image Files

Add your illustration images to the `assets` folder in your project:

```
Synclexia/
├── assets/
│   ├── icon.png (already exists)
│   ├── explore-illustration.png  ← Add this for Login/SignUp header
│   ├── onboarding-1.png          ← Add this for onboarding slide 1
│   ├── onboarding-2.png          ← Add this for onboarding slide 2
│   ├── onboarding-3.png          ← Add this for onboarding slide 3
│   └── onboarding-4.png          ← Add this for onboarding slide 4
```

## Step 2: Update the Code

### For Login & SignUp Screens:

**File:** `src/screens/LoginScreen.js` and `src/screens/SignUpScreen.js`

Find this section (around line 80-90):
```javascript
{/* ADD YOUR ILLUSTRATION IMAGE HERE */}
{/* Uncomment and replace with your actual image: */}
{/* <Image
  source={require('../../assets/explore-illustration.png')}
  style={styles.illustrationImage}
  resizeMode="contain"
/> */}
```

**Uncomment** those lines to enable your illustration:
```javascript
{/* ADD YOUR ILLUSTRATION IMAGE HERE */}
<Image
  source={require('../../assets/explore-illustration.png')}
  style={styles.illustrationImage}
  resizeMode="contain"
/>

{/* Temporary placeholder - Remove when you add your image */}
```

Then **comment out or delete** the placeholder:
```javascript
{/* <View style={styles.illustrationBox}>
  <Text style={styles.exploreText}>EXPLORE</Text>
  ...
</View> */}
```

### For Onboarding Screen:

**File:** `src/screens/OnboardingScreen.js`

Find the `onboardingData` array (around line 13-45) and uncomment the image lines:

```javascript
const onboardingData = [
  {
    id: '1',
    title: 'Dyslexia-Friendly Learning',
    description: '...',
    icon: 'book-outline',
    emoji: '📚',
    image: require('../../assets/onboarding-1.png'), // ← Uncomment this
  },
  {
    id: '2',
    title: 'Make It Your Own!',
    description: '...',
    icon: 'color-palette-outline',
    emoji: '🎨',
    image: require('../../assets/onboarding-2.png'), // ← Uncomment this
  },
  // ... do the same for slides 3 and 4
];
```

## Image Requirements

- **Format:** PNG or JPG
- **Size:** Recommended 500-800px width
- **Background:** Transparent PNG works best for clean look
- **Aspect ratio:** Square or landscape (16:9 or 4:3)

## Testing

After adding images:
1. Reload the app: Press `r` in the terminal or shake device → Reload
2. Clear app cache if images don't show: `npx expo start --clear`

## Troubleshooting

**Images not showing?**
- Check file names match exactly (case-sensitive)
- Make sure files are in the `assets` folder
- Reload the app with `--clear` flag
- Check for typos in `require()` paths

**Images look stretched?**
- Adjust `resizeMode` prop: `contain`, `cover`, or `center`
- Adjust the `style` width/height percentages
