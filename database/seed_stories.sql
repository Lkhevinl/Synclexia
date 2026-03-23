-- Seed Stories Table with 50 diverse stories (levels 1-5)
-- Each story has different difficulty level

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Little Cat', 'A small cat sat on a mat. The cat was happy. It played all day.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Little Cat');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Red Ball', 'A boy had a red ball. He threw the ball in the yard. His dog ran to get it.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Red Ball');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Sunny Day', 'The sun was bright and warm. Kids played outside. They ran and laughed.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Sunny Day');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Apple Tree', 'There was a big apple tree. Red apples grew on it. A girl picked an apple.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Apple Tree');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Fish', 'A fish swam in the water. It was gold and pretty. It moved very fast.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Fish');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Blue Sky', 'The sky was very blue. White clouds floated slowly. Birds flew high above.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Blue Sky');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Green Garden', 'In the garden grew many flowers. They were yellow and pink. Bees came to visit.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Green Garden');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Happy Duck', 'A duck lived in the pond. It dove deep into the water. Then it came back up.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Happy Duck');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Butterfly', 'A butterfly flew through the air. Its wings were colorful and bright. It landed on a flower.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Butterfly');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Rain Falls', 'Rain fell from the clouds. Pitter patter went the raindrops. A girl watched from inside.', 1, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Rain Falls');

-- Level 2 Stories
INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Dog And The Bone', 'A brown dog found a big bone. It was very happy with his treasure. The dog ran around the yard playing with it.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Dog And The Bone');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Summer Adventure', 'During summer, David went to the beach with his family. They built sandcastles and went swimming. It was the best day ever.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Summer Adventure');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Friendly Rabbit', 'A white rabbit lived in the forest. Every morning it hopped to find carrots and clover. Other animals liked to play with it.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Friendly Rabbit');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Birthday Party', 'Sarah had a birthday party in the park. Her friends brought balloons and cake. They played games and had lots of fun.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Birthday Party');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Tall Tree', 'There was a very tall tree in the middle of the forest. Birds made their nests in its branches. Squirrels buried nuts at its base.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Tall Tree');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Cooking Together', 'Mom and Tom cooked cookies together. They mixed flour, eggs, and sugar. The smell was delicious when they baked.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Cooking Together');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Fast Train', 'A train traveled through the countryside bringing passengers to different places. It stopped at stations to pick up more people along the way.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Fast Train');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Stars Above', 'At night, the sky filled with twinkling stars. Children pointed at them and made wishes. The moon shined brightly overhead.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Stars Above');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Helpful Friend', 'Emma saw her friend struggling with homework. She helped him understand the difficult problems. They finished together and felt proud.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Helpful Friend');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Morning Sunrise', 'The sun rose slowly in the morning creating beautiful colors in the sky. Pink, orange, and yellow painted the clouds. A new day had begun.', 2, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Morning Sunrise');

-- Level 3 Stories
INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Mysterious Island', 'Explorers discovered an uncharted island covered with exotic plants and unusual animals. They carefully documented everything they found. The discovery would change geography forever.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Mysterious Island');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Scientific Discovery', 'A young scientist conducted experiments in her laboratory. Through careful observation and testing, she discovered something groundbreaking. Her invention could help thousands of people.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Scientific Discovery');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Ancient Library', 'Archaeologists uncovered an ancient library filled with manuscripts. These documents contained knowledge from civilizations that vanished centuries ago. Scholars worked to translate and preserve them.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Ancient Library');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Ocean Conservation', 'Marine biologists studied coral reefs to understand how to protect them. Pollution and climate change threatened these ecosystems. Their research aimed to develop preservation strategies.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Ocean Conservation');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Space Exploration', 'Astronauts prepared for a mission to explore the outer planets. Years of training and planning preceded this ambitious journey. Technology had advanced significantly since the first space flights.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Space Exploration');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Art Gallery', 'An international art gallery displayed masterpieces from different centuries and cultures. Visitors from around the world came to appreciate artistic achievement. The exhibition changed perspectives on creativity.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Art Gallery');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Mountain Climbing Challenge', 'Mountain climbers faced extreme conditions ascending the highest peak. Their determination and expertise were tested throughout the expedition. Upon reaching the summit they felt accomplished and humbled.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Mountain Climbing Challenge');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Historical Restoration', 'A team of historians and engineers worked to restore an abandoned castle. They researched original designs and carefully reconstructed damaged sections. The restoration revealed fascinating secrets about medieval architecture.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Historical Restoration');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Musical Performance', 'An orchestra prepared for a major concert featuring classical compositions. Musicians practiced dedication for months perfecting their technique. The performance received standing ovations and critical acclaim.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Musical Performance');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Technology Innovation', 'Engineers developed new software to solve transportation problems in major cities. Their algorithms optimized traffic flow significantly. The innovation improved commute times for millions of people.', 3, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Technology Innovation');

-- Level 4 Stories
INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Quantum Revolution', 'Scientists unveiled revolutionary quantum computing technology that surpassed conventional capabilities exponentially. This breakthrough illuminated unprecedented possibilities for solving complex mathematical equations. The implications would fundamentally reshape technological infrastructure globally.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Quantum Revolution');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Genetic Advancement', 'Biotechnologists successfully mapped previously undocumented genetic sequences revealing extraordinary evolutionary patterns. Their meticulous laboratory techniques enabled groundbreaking therapeutic interventions addressing previously incurable disorders. The academic community recognized this accomplishment as transformative.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Genetic Advancement');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Climate Analysis Study', 'Environmental researchers conducted comprehensive atmospheric analysis documenting significant climate variations throughout geological periods. Their sophisticated predictive models incorporated historical data alongside contemporary measurements. This synthesis provided crucial information for implementing environmental protection policies.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Climate Analysis Study');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Diplomatic Resolution', 'International diplomats skillfully negotiated multifaceted agreements between formerly conflicting nations establishing unprecedented economic cooperation frameworks. Their comprehensive approaches addressed historical grievances while promoting mutual prosperity. Geopolitical tensions substantially diminished following the successful negotiations.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Diplomatic Resolution');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Archaeological Excavation', 'Archaeological expeditions unearthed exceptional artifacts illuminating sophisticated ancient civilizations previously obscured by historical obscurity. Sophisticated dating methodologies authenticated remarkable findings establishing chronological accuracy. These discoveries revolutionized archeological understanding substantially.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Archaeological Excavation');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Medical Breakthrough', 'Pharmaceutical researchers developed innovative immunological therapies demonstrating extraordinary effectiveness treating previously intractable diseases. Their rigorous clinical trials substantiated remarkable therapeutic outcomes. International healthcare institutions rapidly implemented these methodologies.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Medical Breakthrough');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Educational Reform', 'Educational administrators implemented transformative pedagogical methodologies incorporating advanced technological infrastructure throughout institutional networks. Comprehensive assessment demonstrated substantially enhanced educational outcomes. Student engagement metrics increased dramatically following implementation.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Educational Reform');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Economic Transformation', 'Financial analysts orchestrated sophisticated investment strategies facilitating substantial economic development throughout previously disadvantaged regions. Meticulous planning incorporated comprehensive stakeholder engagement ensuring sustainable implementation. Macroeconomic indicators demonstrated remarkable improvement trajectories.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Economic Transformation');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Agricultural Innovation', 'Agricultural scientists implemented revolutionary cultivation methodologies substantially increasing crop yields while minimizing environmental degradation. Their sustainable approaches incorporated hydroponics and precision agriculture technologies. Agricultural productivity expanded exponentially benefiting food security initiatives.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Agricultural Innovation');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Infrastructure Development', 'Civil engineers conceptualized and constructed sophisticated metropolitan infrastructure systems optimizing transportation efficiency throughout congested urban environments. Their innovative designs incorporated environmentally conscious principles. Urban development patterns demonstrated substantial improvement in livability metrics.', 4, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Infrastructure Development');

-- Level 5 Stories
INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'The Philosophical Contemplation', 'Metaphysical philosophers engaged in profound epistemological discourse examining fundamental existential parameters transcending conventional phenomenological understanding. Their sophisticated treatises synthesized multifaceted theoretical frameworks incorporating hermeneutic methodologies. These scholarly contributions substantially enriched academic philosophical discourse.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'The Philosophical Contemplation');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Neuroscientific Paradigm', 'Neuroscientists delineated unprecedented neurological mechanisms underlying consciousness and cognition through sophisticated neuroimaging methodologies. Their interdisciplinary investigations synthesized quantum mechanics and biological systems revealing extraordinary cerebral complexity. These discoveries fundamentally reconceptualized psychological understanding.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Neuroscientific Paradigm');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Linguistic Archaeology', 'Linguistic archaeologists reconstructed extinct languages through meticulous comparative philological analysis incorporating archaeological contextualization. Their sophisticated etymological methodologies elucidated communication evolution demonstrating extraordinary linguistic complexity. These achievements revolutionized historical linguistics substantially.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Linguistic Archaeology');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Theoretical Physics Revolution', 'Theoretical physicists articulated revolutionary gravitational theories superseding Newtonian frameworks through sophisticated mathematical formalisms. Their sophisticated tensor calculus and quantum field theoretical approaches unified previously incongruent physical phenomena. These accomplishments represented unprecedented theoretical advancement.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Theoretical Physics Revolution');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Sociological Transformation', 'Sociologists conducted comprehensive ethnographic investigations examining complex sociocultural phenomena transcending disciplinary boundaries. Their sophisticated analytical frameworks synthesized postmodern hermeneutics with empirical methodologies. These investigations substantially advanced sociological epistemic foundations.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Sociological Transformation');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Mathematical Abstraction', 'Mathematicians conceptualized revolutionary abstract algebraic structures illuminating profound symmetry principles underlying mathematical reality. Their sophisticated topological investigations synthesized category theoretical frameworks. These theoretical contributions transcended conventional mathematical understanding substantially.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Mathematical Abstraction');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Aesthetic Philosophy', 'Aesthetic theorists engaged in comprehensive phenomenological investigations examining artistic perception transcending conventional representational frameworks. Their hermeneutic methodologies synthesized ontological perspectives with semiotic analysis. These theoretical achievements enriched aesthetic philosophical discourse profoundly.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Aesthetic Philosophy');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Epistemological Analysis', 'Epistemologists delineated sophisticated frameworks examining knowledge acquisition mechanisms incorporating constructivist and empiricist perspectives. Their analytical methodologies synthesized phenomenology with cognitive neuroscience. These investigations fundamentally reconceptualized epistemological understanding.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Epistemological Analysis');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Cybernetic Systems', 'Cyberneticists articulated revolutionary feedback mechanisms governing complex adaptive systems demonstrating extraordinary self-organization principles. Their sophisticated nonlinear dynamical systems analyses incorporated chaos theory. These theoretical frameworks substantially advanced systems thinking.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Cybernetic Systems');

INSERT INTO public.stories (title, content, level, is_active, created_by)
SELECT 'Quantum Entanglement', 'Quantum physicists investigated extraordinary entanglement phenomena challenging conventional spatial-temporal assumptions. Their sophisticated experimental methodologies substantiated nonlocal quantum correlations. These discoveries profoundly influenced contemporary physical understanding.', 5, TRUE, auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.stories WHERE title = 'Quantum Entanglement');
