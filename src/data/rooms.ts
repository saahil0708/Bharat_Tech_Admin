export interface Room {
    name: string;
    capacity: number;
    venue: string;
    block: string;
    students: number;
}

export const rooms: Room[] = [
    // Block B - Hawkins High School
    { name: "B202", capacity: 9, students: 35, block: "Block B", venue: "Hawkins High School" },
    { name: "B102", capacity: 6, students: 24, block: "Block B", venue: "Hawkins High School" },
    { name: "B103", capacity: 9, students: 36, block: "Block B", venue: "Hawkins High School" },
    { name: "B107", capacity: 7, students: 26, block: "Block B", venue: "Hawkins High School" },
    { name: "B109", capacity: 8, students: 30, block: "Block B", venue: "Hawkins High School" },
    { name: "B111", capacity: 7, students: 28, block: "Block B", venue: "Hawkins High School" },

    // Block G - Castle Byers
    { name: "G002", capacity: 16, students: 64, block: "Block G", venue: "Castle Byers" },
    { name: "G003", capacity: 18, students: 72, block: "Block G", venue: "Castle Byers" },
    { name: "G004", capacity: 16, students: 64, block: "Block G", venue: "Castle Byers" },
    { name: "G005", capacity: 16, students: 64, block: "Block G", venue: "Castle Byers" },
    { name: "G104", capacity: 12, students: 54, block: "Block G", venue: "Castle Byers" },
    { name: "G110", capacity: 12, students: 52, block: "Block G", venue: "Castle Byers" },
    { name: "G213", capacity: 12, students: 48, block: "Block G", venue: "Castle Byers" },
    { name: "G212", capacity: 12, students: 48, block: "Block G", venue: "Castle Byers" },
    { name: "G111", capacity: 12, students: 48, block: "Block G", venue: "Castle Byers" },

    // Block H - Russian Base
    { name: "H101", capacity: 15, students: 60, block: "Block H", venue: "Russian Base" },
    { name: "H102", capacity: 11, students: 44, block: "Block H", venue: "Russian Base" },
    { name: "H103", capacity: 11, students: 46, block: "Block H", venue: "Russian Base" },

    // Block C - Vecna's Lair
    { name: "C uzone1", capacity: 18, students: 76, block: "Block C", venue: "Vecna's Lair" },
    { name: "C uzone2", capacity: 11, students: 44, block: "Block C", venue: "Vecna's Lair" },
    { name: "C uzone 3", capacity: 8, students: 32, block: "Block C", venue: "Vecna's Lair" }
];
