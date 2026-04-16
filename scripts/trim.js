const items = [
    2.3, 2.3,
    2.4, 2.4, 2.4, 2.4,
    2.45, 2.45, 2.45, 2.45, 2.45,
    2.5, 2.5, 2.5, 2.5,
    2.55, 2.55,
    2.6,
    2.67, 2.67,
    2.7, 2.7, 2.7,
    2.75,
    2.8, 2.8,
    2.85,
    2.9, 2.9,
    3.05,
    3.3, 3.3,
    3.4,
    3.45,
    3.5, 3.5
];
const capacity = 10.8;
const cap_i = Math.round(capacity * 100);
let items_i = items.map(x => Math.round(x * 100));

function solve(items_to_pack) {
    let bins = [];
    for (let item of items_to_pack) {
        let placed = false;
        for (let b of bins) {
            let sum = b.reduce((a,c)=>a+c,0);
            if (sum + item <= cap_i) {
                b.push(item);
                placed = true;
                break;
            }
        }
        if (!placed) bins.push([item]);
    }
    return bins;
}

items_i.sort((a,b) => b-a);
let best_bins = solve(items_i);
let best_len = best_bins.length;
let best_score = best_bins.reduce((acc, b) => acc + Math.pow(cap_i - b.reduce((a,c)=>a+c,0), 3), 0);

for(let i=0; i<30000; i++){
    let shuffled = [...items_i];
    shuffled.sort((a,b) => (b + (Math.random()*400-200)) - (a + (Math.random()*400-200)));
    let bins = solve(shuffled);
    if(bins.length < best_len) {
        best_len = bins.length;
        best_bins = bins;
        best_score = bins.reduce((acc, b) => acc + Math.pow(cap_i - b.reduce((a,c)=>a+c,0), 3), 0);
    } else if (bins.length === best_len) {
        let score = bins.reduce((acc, b) => acc + Math.pow(cap_i - b.reduce((a,c)=>a+c,0), 3), 0);
        if(score > best_score) {
            best_score = score;
            best_bins = bins;
        }
    }
}

console.log("TOTAL_BINS: " + best_len);
best_bins.sort((a,b) => b.reduce((x,y)=>x+y,0) - a.reduce((x,y)=>x+y,0));
for(let i=0; i<best_bins.length; i++) {
    let sum = best_bins[i].reduce((a,c)=>a+c,0);
    console.log(`Roll ${i+1}: ${best_bins[i].map(x=>x/100).join(', ')} | Used: ${sum/100} | Waste: ${((cap_i - sum)/100).toFixed(2)}`);
}
