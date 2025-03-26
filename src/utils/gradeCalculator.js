// Grade calculation utilities

export const calculateGrade = (totalMark) => {
    if (totalMark >= 80) return 'A+';
    if (totalMark >= 75) return 'A';
    if (totalMark >= 70) return 'A-';
    if (totalMark >= 65) return 'B+';
    if (totalMark >= 60) return 'B';
    if (totalMark >= 55) return 'B-';
    if (totalMark >= 50) return 'C+';
    if (totalMark >= 45) return 'C';
    if (totalMark >= 40) return 'D';
    return 'F';
};

export const calculateGradePoint = (grade) => {
    switch (grade) {
        case 'A+': return 4.00;
        case 'A': return 3.75;
        case 'A-': return 3.50;
        case 'B+': return 3.25;
        case 'B': return 3.00;
        case 'B-': return 2.75;
        case 'C+': return 2.50;
        case 'C': return 2.25;
        case 'D': return 2.00;
        default: return 0.00;
    }
};

export const calculateCGPA = (results) => {
    if (!results || results.length === 0) return 0;

    let totalCredits = 0;
    let totalGradePoints = 0;

    results.forEach(result => {
        totalCredits += result.credit;
        totalGradePoints += (result.gradePoint * result.credit);
    });

    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
};