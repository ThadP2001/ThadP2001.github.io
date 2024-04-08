class ListWrapper {
    constructor(n=10) {
        this.items = new Array(n).fill(0).map((_, i) => i/n);
        let chart = document.getElementById('chart');
        
        this.shuffle = async function() {
            for (let i = 0; i < n; i++) {
                if (cancelSorting) return;
                const j = Math.floor(Math.random() * n);
                await this.swap(i, j);
            }
        }
        
        function preGet(i) {
            chart.children[i].style.backgroundColor = '#F00';
            if (!audioContext) 
                createAudioContext();
            const computedStyles = window.getComputedStyle(chart);
            let maxHeight = parseInt(computedStyles.height, 10);
            let height = parseInt(chart.children[i].style.height, 10);
            playSound(440 * (maxHeight + height)/maxHeight, 100, 10, 10, 1);
        }
        
        function postGet(i) {
            chart.children[i].style.backgroundColor = '#FFF';
            totalGets.textContent = "Total Gets: " + (parseInt(totalGets.textContent.split(': ')[1], 10) + 1);
        }

        this.getItem = function(index) {
            preGet(index);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(this.items[index]);
                    postGet(index);
                }, sortingSpeed); // Adjust the delay time as needed (1000 milliseconds in this example)
            });
        }
        
        function preSwap(i1, i2) {
            chart.children[i1].style.backgroundColor = '#0F0';
            chart.children[i2].style.backgroundColor = '#0F0';
        
            let _ = chart.children[i1].style.height;
            chart.children[i1].style.height = chart.children[i2].style.height;
            chart.children[i2].style.height = _;

            if (!audioContext) 
                createAudioContext();
            const computedStyles = window.getComputedStyle(chart);
            let maxHeight = parseInt(computedStyles.height, 10);
            let height1 = parseInt(chart.children[i1].style.height, 10);
            let height2 = parseInt(chart.children[i2].style.height, 10);
            playSound(440 * (maxHeight + height1)/maxHeight, 100, 10, 10, 1);
            playSound(440 * (maxHeight + height2)/maxHeight, 100, 10, 10, 1);
        }
        
        function postSwap(i1, i2) {
            chart.children[i1].style.backgroundColor = '#FFF';
            chart.children[i2].style.backgroundColor = '#FFF';
            totalSwaps.textContent = "Total Swaps: " + (parseInt(totalSwaps.textContent.split(': ')[1], 10) + 1);
        }

        this.swap = function(index1, index2) {
            preSwap(index1, index2);
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (0 <= index1 && index1 < this.items.length && 0 <= index2 && index2 < this.items.length) {
                        [this.items[index1], this.items[index2]] = [this.items[index2], this.items[index1]];
                        resolve(true);
                        postSwap(index1, index2);
                    } else {
                        reject(new Error('Invalid indices'));
                    }
                }, sortingSpeed); // Adjust the delay time as needed (1000 milliseconds in this example)
            });
        }
        
        Object.defineProperty(this, 'length', {
            get: function() {
                return this.items.length;
            }
        });
        
    }
}

let audioContext;

function createAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(frequency, duration, attackTime, releaseTime, gainLevel) {
    const oscillator = audioContext.createOscillator();

    const gainNode = audioContext.createGain();

    oscillator.type = 'square';

    oscillator.frequency.value = frequency;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);


    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gainLevel, now + attackTime); // Attack
    gainNode.gain.linearRampToValueAtTime(gainLevel * 0.5, now + attackTime + releaseTime); // Decay
    gainNode.gain.linearRampToValueAtTime(gainLevel * 0.5, now + duration - releaseTime); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    oscillator.start();

    setTimeout(() => {
        oscillator.stop();
    }, duration);
}

var list = new ListWrapper();
const totalGets = document.getElementById("ttlGets");
const totalSwaps = document.getElementById("ttlSwaps");

var sortingSpeed = 1000;

const itemCountSlider = document.getElementById("itemCountSlider");
itemCountSlider.oninput = function() {
    cancelSortingProcess();
    list = new ListWrapper(Number(this.value));
    createBars(list);
}


const sortingSpeedSlider = document.getElementById("sortingSpeedSlider");
sortingSpeedSlider.oninput = function() {
    sortingSpeed = 1000*Math.exp(-1/144.764827301 * this.value);
}

function createBars(list) {
    const chart = document.getElementById('chart');
    const computedStyles = window.getComputedStyle(chart);
    let maxHeight = parseInt(computedStyles.height, 10) || 200;
    let maxWidth = parseInt(computedStyles.width, 10) || 400;
    chart.innerHTML = '';

    for (let i = 0; i < list.length; i++) {
        let value = list.items[i];
        const bar = document.createElement('div');
        bar.classList.add('bar');
        bar.style.height = value * maxHeight + 1 + 'px';
        const width = (maxWidth / (list.length) - 2);
        bar.style.width = width + 'px';
        bar.style.left = (i * (width + 2)) + 'px';
        chart.appendChild(bar);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    createBars(list);
});

const sortingAlgorithmSelect = document.getElementById('sortingAlgorithmSelect');
var selectedAlgorithm = sortingAlgorithmSelect.value || 'selection';

function changeSortingAlgorithm() {
    selectedAlgorithm = sortingAlgorithmSelect.value;
}

async function sort() {
    cancelSorting = false;
    itemCountSlider.disabled = true;
    totalGets.textContent = "Total Gets: 0";
    totalSwaps.textContent = "Total Swaps: 0";
    switch (selectedAlgorithm) {
        case 'bubble':
            console.log('Using bubble sort!');
            await bubbleSort(list);
            break;
        case 'insertion':
            console.log('Using insertion sort!');
            await insertionSort(list);
            break;
        case 'selection':
            console.log('Using selection sort!');
            await selectionSort(list);
            break;
        case 'quick':
            console.log('Using quick sort!');
            await quickSort(list);
            break;
        case 'bogo':
            console.log('Using bogo sort!');
            await bogoSort(list);
            break;
        case 'cycleSort':
            console.log('Using cycle sort!');
            await cycleSort(list);
            break;
        case 'combSort':
            console.log('Using comb sort!');
            await combSort(list);
            break;
        case 'heapSort':
            console.log('Using heap sort!');
            await heapSort(list);
            break;
        case 'mergeSort':
            console.log('Using merge sort!');
            await mergeSort(list);
            break;
        case 'cocktailSort':
            console.log('Using cocktail sort!');
            await cocktailSort(list);
            break;
        case 'shellSort':
            console.log('Using shell sort!');
            await shellSort(list);
            break;
        default:
            console.log('Invalid sorting algorithm.');
            break;
    }
    itemCountSlider.disabled = false;
}

async function selectionSort(list) {
    for (let i = 0; i < list.length - 1; i++) {
        let minIndex = i;
        let minItem = await list.getItem(minIndex);
        
        for (let j = i + 1; j < list.length; j++) {
            if (cancelSorting) return;
            // Get the current item and the item at the minIndex
            const currentItem = await list.getItem(j);
            
            // If the current item is smaller than the item at minIndex, update minIndex
            if (currentItem < minItem) {
                minIndex = j;
                minItem = currentItem;
            }
        }
        
        // Swap the current item with the smallest item found
        await list.swap(i, minIndex);
    }
}

async function bubbleSort(list) {
    const n = list.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (cancelSorting) return;
            // Get the current and next items
            const currentItem = await list.getItem(j);
            const nextItem = await list.getItem(j + 1);
            
            // If the current item is greater than the next item, swap them
            if (currentItem > nextItem) {
                await list.swap(j, j + 1);
            }
        }
    }
}

async function insertionSort(list) {
    const length = list.length;

    for (let i = 1; i < length; i++) {
        let j = i - 1;
        const currentItem = await list.getItem(i);

        while (j >= 0 && (await list.getItem(j)) > currentItem) {
            if (cancelSorting) return;
            await list.swap(j, j + 1);
            j--;
        }
    }
}

async function partition(list, low, high) {
    const pivot = await list.getItem(high);
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (await list.getItem(j) < pivot) {
            if (cancelSorting) return;
            i++;
            await list.swap(i, j);
        }
    }

    await list.swap(i + 1, high);
    return i + 1;
}

async function quickSort(list, low = 0, high = list.length - 1) {
    if (cancelSorting) return;
    if (low < high) {
        const partitionIndex = await partition(list, low, high);

        await quickSort(list, low, partitionIndex - 1);
        await quickSort(list, partitionIndex + 1, high);
    }
}

async function isSorted(list) {
    const length = list.length;
    for (let i = 1; i < length; i++) {
        if (await list.getItem(i - 1) > await list.getItem(i)) {
            return false;
        }
    }
    return true;
}

async function bogoSort(list) {
    while (!(await isSorted(list))) {
        if (cancelSorting) return;
        await list.shuffle();
    }
}

async function cycleSort(list) {
    const n = list.length;

    for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
        if (cancelSorting) return;
        let itemIndex = cycleStart;
        let minItem = await list.getItem(itemIndex);

        for (let i = cycleStart + 1; i < n; i++) {
            if (cancelSorting) return;
            const testItem = await list.getItem(i);
            if (testItem < minItem) {
                itemIndex = i;
                minItem = testItem;
            }
        }

        if (itemIndex === cycleStart) {
            continue;
        }

        let item = await list.getItem(itemIndex);
        let pos = cycleStart;

        while (item === await list.getItem(pos)) {
            if (cancelSorting) return;
            pos++;
        }

        if (itemIndex !== pos) {
            await list.swap(itemIndex, pos);
        }

        while (pos !== cycleStart) {
            if (cancelSorting) return;
            pos = cycleStart;

            for (let i = cycleStart + 1; i < n; i++) {
                if (cancelSorting) return;
                if (await list.getItem(i) < item) {
                    pos++;
                }
            }

            while (item === await list.getItem(pos)) {
                if (cancelSorting) return;
                pos++;
            }

            if (item !== await list.getItem(pos)) {
                await list.swap(itemIndex, pos);
            }
        }
    }
}


async function combSort(list) {
    const n = list.length;
    let gap = n;
    let swapped = true;

    while (gap > 1 || swapped) {
        if (cancelSorting) return;
        gap = Math.max(1, Math.floor(gap / 1.3));
        swapped = false;

        for (let i = 0; i < n - gap; i++) {
            if (cancelSorting) return;
            const currentItem = await list.getItem(i);
            const nextItem = await list.getItem(i + gap);

            if (currentItem > nextItem) {
                await list.swap(i, i + gap);
                swapped = true;
            }
        }
    }
}

async function heapSort(list) {
    const n = list.length;

    async function heapify(list, n, i) {
        if (cancelSorting) return;
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n && (await list.getItem(left)) > (await list.getItem(largest))) {
            largest = left;
        }

        if (right < n && (await list.getItem(right)) > (await list.getItem(largest))) {
            largest = right;
        }

        if (largest !== i) {
            await list.swap(i, largest);
            await heapify(list, n, largest);
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        if (cancelSorting) return;
        await heapify(list, n, i);
    }

    for (let i = n - 1; i > 0; i--) {
        if (cancelSorting) return;
        await list.swap(0, i);
        await heapify(list, i, 0);
    }
}

async function mergeSort(list, low = 0, high = list.length - 1) {
    if (low < high) {
        const mid = Math.floor((low + high) / 2);
        await mergeSort(list, low, mid);
        await mergeSort(list, mid + 1, high);
        await merge(list, low, mid, high);
    }
}

async function merge(list, low, mid, high) {
    let left = low;
    let right = mid + 1;

    while (left < right && right <= high) {
        if (cancelSorting) return;
        if (await list.getItem(left) > await list.getItem(right)) {
            await list.swap(left, right);
            let temp = right;
            while (temp > left + 1 && await list.getItem(temp) < await list.getItem(temp - 1)) {
                await list.swap(temp, temp - 1);
                temp--;
            }
            right++;
        }
        left++;
    }
}

async function cocktailSort(list) {
    const n = list.length;
    let swapped = true;
    let start = 0;
    let end = n - 1;

    while (swapped) {
        if (cancelSorting) return;
        swapped = false;

        for (let i = start; i < end; i++) {
            if (cancelSorting) return;
            if (await list.getItem(i) > await list.getItem(i + 1)) {
                await list.swap(i, i + 1);
                swapped = true;
            }
        }

        if (!swapped) break;

        swapped = false;
        end--;

        for (let i = end - 1; i >= start; i--) {
            if (cancelSorting) return;
            if (await list.getItem(i) > await list.getItem(i + 1)) {
                await list.swap(i, i + 1);
                swapped = true;
            }
        }

        start++;
    }
}

async function shellSort(list) {
    const n = list.length;
    let gap = Math.floor(n / 2);

    while (gap > 0) {
        for (let i = gap; i < n; i++) {
            if (cancelSorting) return;
            const temp = await list.getItem(i);
            let j = i;

            while (j >= gap && (await list.getItem(j - gap)) > temp) {
                if (cancelSorting) return;
                await list.swap(j, j - gap);
                j -= gap;
            }
        }

        gap = Math.floor(gap / 2);
    }
}

async function shuffle() {
    totalGets.textContent = "Total Gets: 0";
    totalSwaps.textContent = "Total Swaps: 0";
    cancelSorting = false;
    itemCountSlider.disabled = true;
    await list.shuffle();
    createBars(list);
    itemCountSlider.disabled = false;
}

let cancelSorting = false;

async function cancelSortingProcess() {
    cancelSorting = true;
}

//test();
