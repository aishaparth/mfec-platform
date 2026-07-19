// Passwords are bcrypt hashes — plaintext values live only in the MFEC/DSAI credential handoff, not in source.
module.exports = [
  {
    username: 'admin',
    passwordHash: '$2b$10$sHJIHESA6ZGpcVNKcly6Du3KbSVNvCvH644vxLI4QLJG6RwVUv4ia',
    role: 'admin',
    name: 'Platform Administrator',
    department: 'MFEC / DSAI',
    avatar: 'A',
  },
  {
    username: 'gov.meghalaya',
    passwordHash: '$2b$10$4eLaejwiHlVuCgOxEn1CR.isglw5GYktIerD7wLUGPYm1d2ezkxK2',
    role: 'governance',
    name: 'Government Official',
    department: 'Dept. of Agriculture, Meghalaya',
    avatar: 'G',
  },
];
