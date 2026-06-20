const { OpenAI } = require('openai');
const pool = require('../config/db');

// Initialize OpenAI client if an API Key is set in the environment
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate a natural language response for chat or WhatsApp.
 * Uses OpenAI GPT-4 if configured, otherwise falls back to a smart local rule-based response.
 * @param {string} userMessage - Message sent by the customer
 * @param {string} fromNumber - Customer's phone number
 * @returns {Promise<string>} Chat response
 */
async function generateResponse(userMessage, fromNumber) {
  if (!openai) {
    const msg = userMessage.toLowerCase().trim();
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello! Thank you for contacting U TECH Fire & Safety Systems. How can we assist you today? You can ask about our fire extinguishers, smoke detectors, installation services, or Fire NOC clearances.";
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('quote') || msg.includes('extinguisher')) {
      return "Our fire safety products (like CO2 and ABC Dry Powder extinguishers) start from Rs. 2,800. For a custom quotation, please provide your email and safety requirements!";
    }
    if (msg.includes('noc') || msg.includes('fire license') || msg.includes('clearance')) {
      return "We offer complete Fire NOC liaisoning services in Haryana. This includes building inspection, drawing preparation, and liaisoning with fire authorities. May we know your building height and type?";
    }
    if (msg.includes('amc') || msg.includes('maintenance') || msg.includes('service')) {
      return "We offer annual maintenance contracts (AMC) for commercial & residential complexes, featuring quarterly scheduled checkups. Let us know how many fire assets you have.";
    }
    return "Thank you for reaching out to U TECH Fire & Safety. Our team has received your message and a sales representative will contact you shortly.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an helpful AI customer service representative for U TECH Fire & Safety Systems (Gurugram). You answer customer queries professionally. We sell fire extinguishers (CO2, ABC, Foam), smoke detectors, fire sprinkler systems, schedule site visits, issue quotations/PIs, execute annual maintenance contracts (AMC), and handle Haryana Fire NOC compliance services. Keep responses under 3 sentences and polite.',
        },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 180,
      temperature: 0.7,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI auto-reply generator error:', error.message);
    return 'Thank you for your message. A representative from U TECH Fire & Safety will contact you shortly.';
  }
}

/**
 * Match a text description of user requirements to actual products in the DB.
 * Uses OpenAI semantic matching if key exists, otherwise uses regex keyword parsing.
 * @param {string} requirementText - Client requirements description
 * @returns {Promise<Array>} List of matched product items
 */
async function matchProductRequirements(requirementText) {
  try {
    const [products] = await pool.query('SELECT id, product_code, name, price, gst_percent FROM products');
    
    if (!openai) {
      // Local keyword matching logic
      const reqLower = requirementText.toLowerCase();
      const matched = products.filter(p => {
        const nameLower = p.name.toLowerCase();
        // check if name keywords are in user requirements
        return nameLower.split(' ').some(word => word.length > 2 && reqLower.includes(word));
      });
      return matched.length > 0 ? matched : products.slice(0, 2);
    }

    const prompt = `Given the customer requirement: "${requirementText}"
Select the most appropriate products from this database JSON:
${JSON.stringify(products)}

Return ONLY a JSON array containing matched product objects with their database ids and recommended quantity based on the requirement text.
Format: [{"id": 1, "qty": 3}, {"id": 2, "qty": 1}]
Do not include any markdowns or explanations.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const outputText = response.choices[0].message.content.trim();
    // Strip markdown formatting if any
    const cleanedJson = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedMatches = JSON.parse(cleanedJson);

    // Hydrate the matched list with full DB details
    return parsedMatches.map(match => {
      const fullPrd = products.find(p => p.id === Number(match.id));
      if (fullPrd) {
        return { ...fullPrd, recommended_qty: match.qty || 1 };
      }
      return null;
    }).filter(p => p !== null);
  } catch (error) {
    console.error('AI Product Matching error:', error);
    // Fallback: return first 2 products
    try {
      const [products] = await pool.query('SELECT id, product_code, name, price, gst_percent FROM products LIMIT 2');
      return products.map(p => ({ ...p, recommended_qty: 1 }));
    } catch (e) {
      return [];
    }
  }
}

/**
 * Generate a smart lead profile analysis and sales advice.
 * @param {string} leadName 
 * @param {string} requirement 
 * @param {number} score 
 * @returns {Promise<object>} Profiling insights { profileGrade, summary, recommendedActions }
 */
async function profileLead(leadName, requirement, score) {
  const defaultProfile = {
    profileGrade: score >= 85 ? 'HOT' : score >= 50 ? 'WARM' : 'COLD',
    summary: `Lead '${leadName}' submitted requirements: "${requirement || 'None specified'}". Rule-based initial evaluation.`,
    recommendedActions: [
      'Assign sales executive to make immediate phone contact.',
      'Check local warehouse stock for firefighting equipment.',
      'Request engineering drawing if NOC project.',
    ],
  };

  if (!openai) {
    return defaultProfile;
  }

  try {
    const prompt = `Lead Name: ${leadName}
Requirement: ${requirement || 'None'}
Engagement Score: ${score}

Analyze this lead and suggest the best sales conversion play.
Return ONLY a valid JSON object matching the schema:
{
  "profileGrade": "HOT" | "WARM" | "COLD",
  "summary": "Brief explanation of user intent and conversion likelihood",
  "recommendedActions": ["Action point 1", "Action point 2", "Action point 3"]
}
Do not write any other text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const outputText = response.choices[0].message.content.trim();
    const cleanedJson = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('AI Lead Profiling error:', error);
    return defaultProfile;
  }
}

module.exports = {
  generateResponse,
  matchProductRequirements,
  profileLead,
};
