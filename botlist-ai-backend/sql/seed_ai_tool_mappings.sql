-- Map selected tools to high-level categories using tools_categories
-- Safe to run multiple times due to ON CONFLICT DO NOTHING on (tool_id, category_id)

BEGIN;

-- Helper: insert mapping if both tool and category exist
-- Pattern: INSERT INTO tools_categories(tool_id, category_id)
--          SELECT t.id, c.id FROM tools t, categories c
--          WHERE t.slug = '<slug>' AND c.name = '<Category>'
--          ON CONFLICT DO NOTHING;

-- Communication / Productivity assistants
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'chatgpt' AND c.name = 'Communication'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'chatgpt' AND c.name = 'Productivity'
ON CONFLICT DO NOTHING;

INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'claude' AND c.name = 'Communication'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'claude' AND c.name = 'Productivity'
ON CONFLICT DO NOTHING;

INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'google-gemini' AND c.name = 'Communication'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'google-gemini' AND c.name = 'Productivity'
ON CONFLICT DO NOTHING;

INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'perplexity' AND c.name = 'Communication'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'perplexity' AND c.name = 'Productivity'
ON CONFLICT DO NOTHING;

INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'elevenlabs' AND c.name = 'Communication'
ON CONFLICT DO NOTHING;

-- Development
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'microsoft-copilot' AND c.name = 'Productivity'
ON CONFLICT DO NOTHING;

INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'github-copilot' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'tabnine' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'replit-ghostwriter' AND c.name = 'Development'
ON CONFLICT DO NOTHING;

INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'hugging-face' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'langchain' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'llama-3' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'mistral-ai' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'cohere' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'anthropic-api' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'openai-api' AND c.name = 'Development'
ON CONFLICT DO NOTHING;

INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'openrouter' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'pinecone' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'weaviate' AND c.name = 'Development'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'qdrant' AND c.name = 'Development'
ON CONFLICT DO NOTHING;

-- Design / Création
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'midjourney' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'dalle' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'stable-diffusion-webui' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'runway' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'pika' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'luma-ai' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'kapwing' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'canva-magic-design' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'figma-ai' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'descript' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'synthesia' AND c.name = 'Design'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'sora' AND c.name = 'Design'
ON CONFLICT DO NOTHING;

-- Marketing
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'jasper' AND c.name = 'Marketing'
ON CONFLICT DO NOTHING;
INSERT INTO tools_categories(tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE t.slug = 'copy-ai' AND c.name = 'Marketing'
ON CONFLICT DO NOTHING;

COMMIT;

