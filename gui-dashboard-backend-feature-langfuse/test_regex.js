const fnTagStartPattern = /<function([$:\s\(=.-]+)([a-zA-Z_][a-zA-Z0-9_]*)/i;
const str = `<function.updateDashboardUI>{"action": "add", "configShowLegend": true}`;
console.log("Match:", fnTagStartPattern.test(str));
