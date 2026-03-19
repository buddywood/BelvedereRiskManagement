#!/usr/bin/env node

/**
 * SVG to JPG Converter for AKILI Logos
 *
 * This script converts the SVG logo files to high-quality JPG format.
 *
 * Prerequisites:
 * npm install sharp (for SVG to JPG conversion)
 *
 * Usage:
 * node convert-to-jpg.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.log('⚠️  Sharp not found. Installing...');
    console.log('Please run: npm install sharp');
    console.log('Then run this script again.');
    process.exit(1);
}

const logoDir = __dirname;
const svgFiles = [
    'akili-stacked.svg',
    'akili-horizontal-compact.svg',
    'akili-trademark-only.svg'
];

async function convertSvgToJpg(svgPath, jpgPath, options = {}) {
    try {
        const {
            width = null,
            height = null,
            density = 300,
            quality = 95,
            background = { r: 255, g: 255, b: 255 }
        } = options;

        await sharp(svgPath, { density })
            .resize(width, height)
            .jpeg({ quality, background })
            .toFile(jpgPath);

        console.log(`✅ Converted: ${path.basename(svgPath)} → ${path.basename(jpgPath)}`);
    } catch (error) {
        console.error(`❌ Error converting ${svgPath}:`, error.message);
    }
}

async function convertAllLogos() {
    console.log('🎨 Converting AKILI logos from SVG to JPG...\n');

    const conversions = [
        // Stacked version - good for letterheads, business cards
        {
            input: 'akili-stacked.svg',
            output: 'akili-stacked.jpg',
            options: { density: 300, quality: 95 }
        },
        {
            input: 'akili-stacked.svg',
            output: 'akili-stacked-web.jpg',
            options: { width: 400, density: 72, quality: 90 }
        },

        // Horizontal compact - good for headers, navigation
        {
            input: 'akili-horizontal-compact.svg',
            output: 'akili-horizontal-compact.jpg',
            options: { density: 300, quality: 95 }
        },
        {
            input: 'akili-horizontal-compact.svg',
            output: 'akili-horizontal-compact-web.jpg',
            options: { width: 600, density: 72, quality: 90 }
        },

        // Trademark only - good for signatures, minimal usage
        {
            input: 'akili-trademark-only.svg',
            output: 'akili-trademark-only.jpg',
            options: { density: 300, quality: 95 }
        },
        {
            input: 'akili-trademark-only.svg',
            output: 'akili-trademark-only-web.jpg',
            options: { width: 360, density: 72, quality: 90 }
        }
    ];

    for (const conversion of conversions) {
        const svgPath = path.join(logoDir, conversion.input);
        const jpgPath = path.join(logoDir, conversion.output);

        if (fs.existsSync(svgPath)) {
            await convertSvgToJpg(svgPath, jpgPath, conversion.options);
        } else {
            console.error(`❌ SVG file not found: ${svgPath}`);
        }
    }

    console.log('\n📁 Generated files:');
    console.log('├── High-resolution (300 DPI) - for print materials');
    console.log('├── Web-optimized (72 DPI) - for digital use');
    console.log('└── Original SVG files - for vector scaling');

    console.log('\n🎯 Usage recommendations:');
    console.log('• Stacked version: Business cards, letterheads, large displays');
    console.log('• Horizontal compact: Website headers, email signatures');
    console.log('• Trademark only: Minimal usage, signatures, favicon text');
}

// Run the conversion
convertAllLogos().catch(console.error);