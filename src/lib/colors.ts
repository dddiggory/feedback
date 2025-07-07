const GRADIENTS = [
    // 'bg-gradient-to-r from-slate-50 to-emerald-200',
    // 'bg-gradient-to-r from-slate-50 to-teal-200',
    // 'bg-gradient-to-r from-slate-50 to-pink-200',
    // 'bg-gradient-to-r from-slate-50 to-violet-200',
    'bg-gradient-to-r from-blue-100 to-blue-200',
    'bg-gradient-to-r from-green-100 to-green-200',
    'bg-gradient-to-r from-purple-100 to-purple-200',
    'bg-gradient-to-r from-pink-100 to-pink-200',
    'bg-gradient-to-r from-yellow-100 to-yellow-200',
    'bg-gradient-to-r from-indigo-100 to-indigo-200',
    'bg-gradient-to-r from-red-100 to-red-200',
    'bg-gradient-to-r from-orange-100 to-orange-200',
] as const

export function getRandomGradient() {
    return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
}

export function getRandomColor() {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'];
    return colors[Math.floor(Math.random() * colors.length)];
}