-- ============================================================
-- QUICK SEED: Stories (for ReadingScreen)
-- Run this in Supabase SQL Editor after COMPLETE_SETUP.sql
-- ============================================================

INSERT INTO public.stories (title, content, level, is_active) VALUES
-- Level 1 (Easy)
('The Little Cat', 'A small cat sat on a mat. The cat was happy. It played all day.', 1, true),
('The Red Ball', 'A boy had a red ball. He threw the ball in the yard. His dog ran to get it.', 1, true),
('Sunny Day', 'The sun was bright and warm. Kids played outside. They ran and laughed.', 1, true),
('Apple Tree', 'There was a big apple tree. Red apples grew on it. A girl picked an apple.', 1, true),
('The Fish', 'A fish swam in the water. It was gold and pretty. It moved very fast.', 1, true),
('Blue Sky', 'The sky was very blue. White clouds floated slowly. Birds flew high above.', 1, true),
('Green Garden', 'In the garden grew many flowers. They were yellow and pink. Bees came to visit.', 1, true),
('Happy Duck', 'A duck lived in the pond. It dove deep into the water. Then it came back up.', 1, true),
('The Butterfly', 'A butterfly flew through the air. Its wings were colorful and bright. It landed on a flower.', 1, true),
('Rain Falls', 'Rain fell from the clouds. Pitter patter went the raindrops. A girl watched from inside.', 1, true),

-- Level 2 (Medium)
('The Dog And The Bone', 'A brown dog found a big bone. It was very happy with his treasure. The dog ran around the yard playing with it.', 2, true),
('Summer Adventure', 'During summer, David went to the beach with his family. They built sandcastles and went swimming. It was the best day ever.', 2, true),
('The Friendly Rabbit', 'A white rabbit lived in the forest. Every morning it hopped to find carrots and clover. Other animals liked to play with it.', 2, true),
('Birthday Party', 'Sarah had a birthday party in the park. Her friends brought balloons and cake. They played games and had lots of fun.', 2, true),
('The Tall Tree', 'There was a very tall tree in the middle of the forest. Birds made their nests in its branches. Squirrels buried nuts at its base.', 2, true),
('Cooking Together', 'Mom and Tom cooked cookies together. They mixed flour, eggs, and sugar. The smell was delicious when they baked.', 2, true),
('The Fast Train', 'A train traveled through the countryside bringing passengers to different places. It stopped at stations to pick up more people along the way.', 2, true),
('Stars Above', 'At night, the sky filled with twinkling stars. Children pointed at them and made wishes. The moon shined brightly overhead.', 2, true),
('The Helpful Friend', 'Emma saw her friend struggling with homework. She helped him understand the difficult problems. They finished together and felt proud.', 2, true),
('Morning Sunrise', 'The sun rose slowly in the morning creating beautiful colors in the sky. Pink, orange, and yellow painted the clouds. A new day had begun.', 2, true),

-- Level 3 (Advanced)
('The Mysterious Island', 'Explorers discovered an uncharted island covered with exotic plants and unusual animals. They carefully documented everything they found. The discovery would change geography forever.', 3, true),
('Scientific Discovery', 'A young scientist conducted experiments in her laboratory. Through careful observation and testing, she discovered something groundbreaking. Her invention could help thousands of people.', 3, true),
('The Ancient Library', 'Archaeologists uncovered an ancient library filled with manuscripts. These documents contained knowledge from civilizations that vanished centuries ago. Scholars worked to translate and preserve them.', 3, true),
('Ocean Conservation', 'Marine biologists studied coral reefs to understand how to protect them. Pollution and climate change threatened these ecosystems. Their research aimed to develop preservation strategies.', 3, true),
('Space Exploration', 'Astronauts prepared for a mission to explore the outer planets. Years of training and planning preceded this ambitious journey. Technology had advanced significantly since the first space flights.', 3, true),
('The Art Gallery', 'An international art gallery displayed masterpieces from different centuries and cultures. Visitors from around the world came to appreciate artistic achievement. The exhibition changed perspectives on creativity.', 3, true),
('Mountain Climbing Challenge', 'Mountain climbers faced extreme conditions ascending the highest peak. Their determination and expertise were tested throughout the expedition. Upon reaching the summit they felt accomplished and humbled.', 3, true),
('Historical Restoration', 'A team of historians and engineers worked to restore an abandoned castle. They researched original designs and carefully reconstructed damaged sections. The restoration revealed fascinating secrets about medieval architecture.', 3, true),
('Musical Performance', 'An orchestra prepared for a major concert featuring classical compositions. Musicians practiced dedication for months perfecting their technique. The performance received standing ovations and critical acclaim.', 3, true),
('Technology Innovation', 'Engineers developed new software to solve transportation problems in major cities. Their algorithms optimized traffic flow significantly. The innovation improved commute times for millions of people.', 3, true),

-- Level 4 (Difficult)
('The Quantum Revolution', 'Scientists unveiled revolutionary quantum computing technology that surpassed conventional capabilities exponentially. This breakthrough illuminated unprecedented possibilities for solving complex mathematical equations.', 4, true),
('Genetic Advancement', 'Biotechnologists successfully mapped previously undocumented genetic sequences revealing extraordinary evolutionary patterns. Their meticulous laboratory techniques enabled groundbreaking therapeutic interventions.', 4, true),
('Climate Analysis Study', 'Environmental researchers conducted comprehensive atmospheric analysis documenting significant climate variations throughout geological periods. Their sophisticated predictive models incorporated historical data.', 4, true),
('Diplomatic Resolution', 'International diplomats skillfully negotiated multifaceted agreements between formerly conflicting nations establishing unprecedented economic cooperation frameworks.', 4, true),
('Archaeological Excavation', 'Archaeological expeditions unearthed exceptional artifacts illuminating sophisticated ancient civilizations previously obscured by historical obscurity.', 4, true),
('Medical Breakthrough', 'Pharmaceutical researchers developed innovative immunological therapies demonstrating extraordinary effectiveness treating previously intractable diseases.', 4, true),
('Educational Reform', 'Educational administrators implemented transformative pedagogical methodologies incorporating advanced technological infrastructure throughout institutional networks.', 4, true),
('Economic Transformation', 'Financial analysts orchestrated sophisticated investment strategies facilitating substantial economic development throughout previously disadvantaged regions.', 4, true),
('Agricultural Innovation', 'Agricultural scientists implemented revolutionary cultivation methodologies substantially increasing crop yields while minimizing environmental degradation.', 4, true),
('Infrastructure Development', 'Civil engineers conceptualized and constructed sophisticated metropolitan infrastructure systems optimizing transportation efficiency throughout congested urban environments.', 4, true),

-- Level 5 (Expert)
('The Philosophical Contemplation', 'Metaphysical philosophers engaged in profound epistemological discourse examining fundamental existential parameters transcending conventional phenomenological understanding.', 5, true),
('Neuroscientific Paradigm', 'Neuroscientists delineated unprecedented neurological mechanisms underlying consciousness and cognition through sophisticated neuroimaging methodologies.', 5, true),
('Linguistic Archaeology', 'Linguistic archaeologists reconstructed extinct languages through meticulous comparative philological analysis incorporating archaeological contextualization.', 5, true),
('Theoretical Physics Revolution', 'Theoretical physicists articulated revolutionary gravitational theories superseding Newtonian frameworks through sophisticated mathematical formalisms.', 5, true),
('Sociological Transformation', 'Sociologists conducted comprehensive ethnographic investigations examining complex sociocultural phenomena transcending disciplinary boundaries.', 5, true),
('Mathematical Abstraction', 'Mathematicians conceptualized revolutionary abstract algebraic structures illuminating profound symmetry principles underlying mathematical reality.', 5, true),
('Aesthetic Philosophy', 'Aesthetic theorists engaged in comprehensive phenomenological investigations examining artistic perception transcending conventional representational frameworks.', 5, true),
('Epistemological Analysis', 'Epistemologists delineated sophisticated frameworks examining knowledge acquisition mechanisms incorporating constructivist and empiricist perspectives.', 5, true),
('Cybernetic Systems', 'Cyberneticists articulated revolutionary feedback mechanisms governing complex adaptive systems demonstrating extraordinary self-organization principles.', 5, true),
('Quantum Entanglement', 'Quantum physicists investigated extraordinary entanglement phenomena challenging conventional spatial-temporal assumptions through sophisticated experimental methodologies.', 5, true)
ON CONFLICT DO NOTHING;
