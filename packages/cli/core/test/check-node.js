const current = process.versions.node;

const required = {
  min18: "18.18.0",
  min22: "22.18.0",
};

const semver = (a, b) => {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
};

if (semver(current, required.min18) < 0 && semver(current, required.min22) < 0) {
  console.error(`\n❌ You are using Node.js ${current}.\n` + `Beech requires Node.js version ${required.min18}+ or ${required.min22}+.\n` + `Please upgrade your Node.js version.\n`);
  process.exit(1);
}
