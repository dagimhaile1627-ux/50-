import { UserProfile, CompatibilityBreakdown } from '../types';

export function calculateCompatibility(userA: UserProfile, userB: UserProfile): CompatibilityBreakdown {
  const reasons: string[] = [];

  // 1. Interest Match (Weight: 30%)
  const interestsA = new Set((userA.interests || []).map((i) => i.toLowerCase().trim()));
  const interestsB = new Set((userB.interests || []).map((i) => i.toLowerCase().trim()));
  const sharedInterests: string[] = [];

  interestsA.forEach((interest) => {
    if (interestsB.has(interest)) {
      sharedInterests.push(interest);
    }
  });

  const maxInterests = Math.max(interestsA.size, interestsB.size, 1);
  const interestRatio = Math.min(sharedInterests.length / Math.min(maxInterests, 5), 1.0);
  const interestScore = Math.round(interestRatio * 30);

  if (sharedInterests.length > 0) {
    const formatted = sharedInterests.slice(0, 3).map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');
    reasons.push(`Both enjoy ${formatted}`);
  }

  // 2. Relationship Goal Match (Weight: 25%)
  const goalsA = new Set(userA.relationshipGoals || []);
  const goalsB = new Set(userB.relationshipGoals || []);
  const sharedGoals: string[] = [];

  goalsA.forEach((g) => {
    if (goalsB.has(g)) {
      sharedGoals.push(g);
    }
  });

  let goalRatio = 0.4; // Base baseline
  if (sharedGoals.length > 0) {
    goalRatio = Math.min(0.7 + sharedGoals.length * 0.15, 1.0);
    const friendlyGoal = sharedGoals[0].replace(/_/g, ' ');
    reasons.push(`Both are seeking ${friendlyGoal}`);
  }
  const relationshipGoalScore = Math.round(goalRatio * 25);

  // 3. Location / Distance Match (Weight: 20%)
  const distanceMiles = userB.distanceMiles ?? (userB.location?.distanceMiles ?? 10);
  const distanceKm = Math.round(distanceMiles * 1.60934);
  let locationRatio = 1.0;

  if (distanceMiles <= 10) {
    locationRatio = 1.0;
    reasons.push(`Lives very close (${distanceKm} km / ${distanceMiles} miles away)`);
  } else if (distanceMiles <= 25) {
    locationRatio = 0.85;
    reasons.push(`Lives within easy reach (${distanceKm} km away)`);
  } else if (distanceMiles <= 50) {
    locationRatio = 0.65;
  } else {
    locationRatio = 0.45;
  }
  const locationScore = Math.round(locationRatio * 20);

  // 4. Lifestyle Match (Weight: 15%)
  const lifestyleMatches: string[] = [];
  let lifestylePoints = 0;
  const totalLifestyleCategories = 4;

  // Smoking
  if (userA.lifestyle?.smoking === userB.lifestyle?.smoking) {
    lifestylePoints += 1;
    if (userA.lifestyle?.smoking === 'non_smoker') {
      lifestyleMatches.push('Both non-smokers');
    }
  }

  // Alcohol
  if (userA.lifestyle?.alcohol === userB.lifestyle?.alcohol || (userA.lifestyle?.alcohol !== 'regular' && userB.lifestyle?.alcohol !== 'regular')) {
    lifestylePoints += 1;
    lifestyleMatches.push('Compatible drinking preferences');
  }

  // Activity Level
  if (userA.lifestyle?.activityLevel === userB.lifestyle?.activityLevel) {
    lifestylePoints += 1;
    const act = userA.lifestyle?.activityLevel?.replace(/_/g, ' ');
    lifestyleMatches.push(`Both prefer ${act} pace`);
    reasons.push(`Both have a ${act} daily activity rhythm`);
  } else {
    lifestylePoints += 0.5;
  }

  // Pets
  const petsA = userA.lifestyle?.pets || [];
  const petsB = userB.lifestyle?.pets || [];
  if (petsA.length > 0 && petsB.length > 0) {
    lifestylePoints += 1;
    lifestyleMatches.push('Both pet lovers');
    reasons.push('Shared love for animal companions');
  } else {
    lifestylePoints += 0.8;
  }

  const lifestyleRatio = Math.min(lifestylePoints / totalLifestyleCategories, 1.0);
  const lifestyleScore = Math.round(lifestyleRatio * 15);

  // 5. Age Preference (Weight: 10%)
  const ageDiff = Math.abs((userA.age || 60) - (userB.age || 60));
  let ageRatio = 1.0;
  if (ageDiff <= 5) {
    ageRatio = 1.0;
    reasons.push(`Very close in age (${userB.age} and ${userA.age})`);
  } else if (ageDiff <= 10) {
    ageRatio = 0.85;
  } else if (ageDiff <= 15) {
    ageRatio = 0.7;
  } else {
    ageRatio = 0.5;
  }
  const agePreferenceScore = Math.round(ageRatio * 10);

  const overallScore = Math.min(
    Math.max(interestScore + relationshipGoalScore + locationScore + lifestyleScore + agePreferenceScore, 65),
    99
  );

  // Fallback reason if none generated
  if (reasons.length === 0) {
    reasons.push('Shared mature perspective and verified identity');
  }

  return {
    overallScore,
    interestScore,
    relationshipGoalScore,
    locationScore,
    lifestyleScore,
    agePreferenceScore,
    sharedInterests,
    sharedGoals,
    lifestyleMatches,
    distanceKm,
    reasons: reasons.slice(0, 4),
  };
}
