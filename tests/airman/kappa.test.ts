import { test } from "node:test";
import assert from "node:assert/strict";
import { quadraticWeightedKappa, exactAgreement, adjacentAgreement, pairsFrom, humanPairs } from "../../lib/airman/kappa.ts";

test("QWK: perfect agreement is 1, undefined cases are null", () => {
  assert.equal(quadraticWeightedKappa([{ gene: 1, human: 1 }, { gene: 3, human: 3 }, { gene: 5, human: 5 }]), 1);
  assert.equal(quadraticWeightedKappa([]), null);
  assert.equal(quadraticWeightedKappa([{ gene: 3, human: 3 }, { gene: 3, human: 3 }]), null);
});

test("QWK matches a hand calculation", () => {
  // pairs (g,h): (1,1) (2,3) (3,3) (5,4); k=5, weights (i-j)^2/16
  // observed weighted disagreement = (1 + 1)/16 = 0.125
  // marginals g: {1,2,3,5} h: {1,3,3,4}; expected = sum_ij w_ij * a_i * b_j / 4
  const pairs = [{ gene: 1, human: 1 }, { gene: 2, human: 3 }, { gene: 3, human: 3 }, { gene: 5, human: 4 }];
  const g = [1, 2, 3, 5], h = [1, 3, 3, 4];
  let exp = 0;
  for (const i of g) for (const j of h) exp += ((i - j) ** 2) / 16 / 4;
  assert.ok(Math.abs((quadraticWeightedKappa(pairs) as number) - (1 - 0.125 / exp)) < 1e-12);
});

test("systematic disagreement goes negative; out-of-scale throws", () => {
  assert.ok((quadraticWeightedKappa([{ gene: 1, human: 5 }, { gene: 5, human: 1 }]) as number) < 0);
  assert.throws(() => quadraticWeightedKappa([{ gene: 0, human: 3 }]));
});

test("exact/adjacent agreement and pair building", () => {
  const p = [{ gene: 2, human: 2 }, { gene: 2, human: 3 }, { gene: 1, human: 4 }];
  assert.equal(exactAgreement(p), 1 / 3);
  assert.equal(adjacentAgreement(p), 2 / 3);
  const reads = [{ id: "a", reasoning_grade: 3 }, { id: "b", reasoning_grade: 4 }];
  const scores = [{ read_id: "a", rater_id: "r1", grade: 2 }, { read_id: "a", rater_id: "r2", grade: 3 }];
  assert.deepEqual(pairsFrom(reads, scores), [{ gene: 3, human: 3 }]); // mean 2.5 rounds to 3; b unscored
  assert.deepEqual(humanPairs(scores), [{ gene: 2, human: 3 }]);
});
