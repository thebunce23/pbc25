const { calculateOptimalTeamSizes } = require('./src/lib/utils/team-utils.ts');

console.log('=== DEBUGGING TEAM CREATION ===');

// Test with 12 players, preferred team size 4
const result = calculateOptimalTeamSizes(12, 4);
console.log('Result for 12 players, preferred size 4:', result);

// Test with 12 players, preferred team size 3
const result2 = calculateOptimalTeamSizes(12, 3);
console.log('Result for 12 players, preferred size 3:', result2);

// Test with 12 players, preferred team size 2
const result3 = calculateOptimalTeamSizes(12, 2);
console.log('Result for 12 players, preferred size 2:', result3);
