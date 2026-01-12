# Haishoku (配色)

Haishoku is a web-based image color palette converter that transforms your images to use specific color schemes. The name "Haishoku" (配色) is Japanese for "color scheme" or "color arrangement".

## What is Haishoku?

Haishoku is a tool that takes any image and converts it to use a specific color palette by mapping each pixel to the nearest color in the selected theme. This is perfect for:

- Creating wallpapers that match your terminal/editor color scheme
- Generating aesthetically consistent images for your desktop environment
- Experimenting with different color palettes on your favorite images
- Creating themed artwork

## Features

- **🎨 Multiple Color Themes**: Choose from popular color schemes including:
  - Catppuccin Mocha (dark theme with pastel colors)
  - Catppuccin Latte (light theme variant)
  - Gruvbox (retro warm color scheme)

- **🎚️ Adjustable Conversion Rate**: Control how much of the original color is replaced with theme colors (0-100%)

- **📁 Easy Image Upload**: Simple drag-and-drop or file picker interface

- **💾 Download Converted Images**: Save your themed images as PNG files

- **🎨 Color Palette Preview**: View all colors in the selected theme

- **🔄 Reset Functionality**: Quickly revert to the original image

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Color Palettes**: Catppuccin and Gruvbox themes

## How It Works

The application uses a **nearest-color algorithm** to convert images:

1. Each pixel in the uploaded image is analyzed for its RGB color values
2. The algorithm calculates the Euclidean distance between the pixel color and all colors in the selected theme
3. The pixel is replaced with (or blended with) the closest matching color from the theme
4. The conversion rate slider allows you to control the blending between the original and theme colors

The conversion is processed in batches to maintain UI responsiveness even with large images.

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/TheDanDan/Haishoku.git
cd Haishoku

# Install dependencies
npm install
```

### Running the Application

```bash
# Start the development server
npm run dev

# Open the provided local URL in your browser (typically http://localhost:5173)
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Usage

1. **Upload an Image**: Click on the file input or drag and drop an image
2. **Select a Theme**: Choose your preferred color scheme from the theme picker
3. **Adjust Conversion Rate**: Use the slider to control how much the colors are converted (80% recommended)
4. **Convert**: Click the "Convert" button to apply the color scheme
5. **Download**: Save your newly themed image using the "Download" button
6. **Reset**: Click "Reset" to revert to the original image

## Project Structure

```
src/
├── components/        # React components
│   ├── ColorPalette.tsx    # Display theme colors
│   ├── ImageDisplay.tsx    # Canvas-based image display and conversion
│   ├── ImageDropper.tsx    # File upload component
│   └── ThemePicker.tsx     # Theme selection component
├── constants/        # Theme definitions
│   └── themes.ts           # RGB and HEX color definitions
├── utils/           # Utility functions
│   └── convert.ts          # Image conversion algorithm
└── App.tsx          # Main application component
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Color schemes from [Catppuccin](https://github.com/catppuccin/catppuccin) and [Gruvbox](https://github.com/morhetz/gruvbox)
