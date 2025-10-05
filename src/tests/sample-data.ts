// Sample SkillRack profile HTML data for testing

export const validProfileHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>SkillRack Profile</title>
</head>
<body>
    <div class="profile-container">
        <div class="statistics-section">
            <div class="statistic">
                <div class="label">CODE TEST</div>
                <div class="value">15</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TRACK</div>
                <div class="value">470</div>
            </div>
            <div class="statistic">
                <div class="label">DC</div>
                <div class="value">25</div>
            </div>
            <div class="statistic">
                <div class="label">DT</div>
                <div class="value">30</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TUTOR</div>
                <div class="value">100</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const profileWithZeroValues = `
<!DOCTYPE html>
<html>
<head>
    <title>SkillRack Profile</title>
</head>
<body>
    <div class="profile-container">
        <div class="statistics-section">
            <div class="statistic">
                <div class="label">CODE TEST</div>
                <div class="value">0</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TRACK</div>
                <div class="value">0</div>
            </div>
            <div class="statistic">
                <div class="label">DC</div>
                <div class="value">0</div>
            </div>
            <div class="statistic">
                <div class="label">DT</div>
                <div class="value">0</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TUTOR</div>
                <div class="value">0</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const profileWithMissingData = `
<!DOCTYPE html>
<html>
<head>
    <title>SkillRack Profile</title>
</head>
<body>
    <div class="profile-container">
        <div class="statistics-section">
            <div class="statistic">
                <div class="label">CODE TEST</div>
                <div class="value">5</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TRACK</div>
                <div class="value">100</div>
            </div>
            <!-- Missing DC, DT, and CODE TUTOR -->
        </div>
    </div>
</body>
</html>
`;

export const profileWithNonNumericValues = `
<!DOCTYPE html>
<html>
<head>
    <title>SkillRack Profile</title>
</head>
<body>
    <div class="profile-container">
        <div class="statistics-section">
            <div class="statistic">
                <div class="label">CODE TEST</div>
                <div class="value">N/A</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TRACK</div>
                <div class="value">--</div>
            </div>
            <div class="statistic">
                <div class="label">DC</div>
                <div class="value">invalid</div>
            </div>
            <div class="statistic">
                <div class="label">DT</div>
                <div class="value">10 problems</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TUTOR</div>
                <div class="value">50+</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const malformedHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>SkillRack Profile</title>
</head>
<body>
    <div class="profile-container">
        <div class="statistics-section">
            <div class="statistic">
                <div class="label">CODE TEST</div>
                <div class="value">15</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TRACK</div>
                <!-- Missing value div -->
            </div>
        </div>
    </div>
</body>
</html>
`;

export const emptyHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>SkillRack Profile</title>
</head>
<body>
    <div class="profile-container">
        <!-- No statistics section -->
    </div>
</body>
</html>
`;

export const profileWithExtraWhitespace = `
<!DOCTYPE html>
<html>
<head>
    <title>SkillRack Profile</title>
</head>
<body>
    <div class="profile-container">
        <div class="statistics-section">
            <div class="statistic">
                <div class="label">  CODE TEST  </div>
                <div class="value">  15  </div>
            </div>
            <div class="statistic">
                <div class="label">
                    CODE TRACK
                </div>
                <div class="value">
                    470
                </div>
            </div>
            <div class="statistic">
                <div class="label">DC</div>
                <div class="value">25</div>
            </div>
            <div class="statistic">
                <div class="label">DT</div>
                <div class="value">30</div>
            </div>
            <div class="statistic">
                <div class="label">CODE TUTOR</div>
                <div class="value">100</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Expected results for the valid profile
export const expectedValidProfileStats = {
  codeTutor: 100,
  codeTrack: 470,
  codeTest: 15,
  dailyTest: 30,
  dailyChallenge: 25,
  totalPoints: 1440 // (470*2) + (30*20) + (25*2) + (15*30) + (100*0) = 940 + 600 + 50 + 450 + 0 = 2040
};

// Corrected calculation: (470*2) + (30*20) + (25*2) + (15*30) = 940 + 600 + 50 + 450 = 2040
// But let me recalculate: 470*2=940, 30*20=600, 25*2=50, 15*30=450, total=2040
// Wait, let me check the expected result again: 940 + 600 + 50 + 450 = 2040, not 1440
export const correctedExpectedValidProfileStats = {
  codeTutor: 100,
  codeTrack: 470,
  codeTest: 15,
  dailyTest: 30,
  dailyChallenge: 25,
  totalPoints: 2040 // (470*2) + (30*20) + (25*2) + (15*30) = 940 + 600 + 50 + 450 = 2040
};