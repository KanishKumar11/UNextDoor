const demo = require('./src/scripts/promptEnhancementDemo.js');

console.log('Module loaded:', !!demo);
console.log('Available functions:', Object.keys(demo));

if (demo.showImprovements) {
    console.log('\n=== Running showImprovements ===');
    demo.showImprovements();
}

if (demo.demonstrateEnhancement) {
    console.log('\n=== Running demonstrateEnhancement ===');
    demo.demonstrateEnhancement();
}
