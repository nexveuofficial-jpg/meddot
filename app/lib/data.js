export const NOTES_DB = [
    {
        id: "1",
        title: "Anatomy of the Human Heart",
        subject: "Anatomy",
        year: "1st Year",
        author: "Dr. Sarah Chen",
        date: "Dec 12, 2024",
        readTime: "15 min",
        content: `
            <p>The human heart is an organ that pumps blood throughout the body via the circulatory system, supplying oxygen and nutrients to the tissues and removing carbon dioxide and other wastes.</p>
            <h2>1. Chambers of the Heart</h2>
            <p>The heart is divided into four chambers:</p>
            <ul>
                <li><strong>Right Atrium:</strong> Receives deoxygenated blood from the body.</li>
                <li><strong>Right Ventricle:</strong> Pumps deoxygenated blood to the lungs.</li>
                <li><strong>Left Atrium:</strong> Receives oxygenated blood from the lungs.</li>
                <li><strong>Left Ventricle:</strong> Pumps oxygenated blood to the rest of the body.</li>
            </ul>
            <h2>2. Valves</h2>
            <p>Valves prevent the backward flow of blood. The major valves include:</p>
            <ul>
                <li>Tricuspid valve</li>
                <li>Pulmonary valve</li>
                <li>Mitral (Bicuspid) valve</li>
                <li>Aortic valve</li>
            </ul>
        `
    },
    {
        id: "2",
        title: "Pharmacology: Antibiotics Classes",
        subject: "Pharmacology",
        year: "2nd Year",
        author: "Prof. James Wilson",
        date: "Nov 28, 2024",
        readTime: "20 min",
        content: `
            <p>Antibiotics are powerful medicines that fight certain infections and can save lives when used properly. They either stop bacteria from reproducing or destroy them.</p>
            <h2>Beta-Lactams</h2>
            <p>This class includes penicillins and cephalosporins. They work by inhibiting cell wall synthesis.</p>
            <h2>Macrolides</h2>
            <p>Includes Erythromycin and Azithromycin. They inhibit protein synthesis by binding to the 50S ribosomal subunit.</p>
        `
    },
    {
        id: "3",
        title: "Introduction to Pathology",
        subject: "Pathology",
        year: "2nd Year",
        author: "Dr. Emily Ruiza",
        date: "Jan 10, 2025",
        readTime: "12 min",
        content: `
            <p>Pathology is the study of the causes and effects of disease or injury. The word pathology also refers to the study of disease in general, incorporating a wide range of biology research fields and medical practices.</p>
            <h2>Cellular Injury</h2>
            <p>Cellular injury can be reversible or irreversible. The mechanisms include ATP depletion, mitochondrial damage, and influx of calcium.</p>
        `
    },
    {
        id: "4",
        title: "Biochemistry: Krebs Cycle",
        subject: "Biochemistry",
        year: "1st Year",
        author: "Dr. Alan Grant",
        date: "Jan 5, 2025",
        readTime: "18 min",
        content: `
            <p>The citric acid cycle (Krebs cycle) is a series of chemical reactions used by all aerobic organisms to release stored energy through the oxidation of acetyl-CoA derived from carbohydrates, fats, and proteins.</p>
        `
    }
];

export const getNoteById = (id) => NOTES_DB.find(note => note.id === id);
