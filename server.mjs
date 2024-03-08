import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/:formId/filteredResponses', async (req, res) => {
  try {
    const { formId } = req.params;
    const { filters, ...otherParams } = req.query;

    const parsedFilters = JSON.parse(filters);

    const responses = await fetch(`https://fillout.com/api/${formId}/responses?${new URLSearchParams(otherParams)}`)
      .then(res => res.json());

    const filteredResponses = responses.filter(response => applyFilters(response, parsedFilters));

    res.json(filteredResponses);    
  } catch (error) {
    console.error('Error fetching and filtering responses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function applyFilters(response, filters) {
  for (const filter of filters) {
    const { id, condition, value } = filter;
    const responseValue = response[id];

    switch (condition) {
      case 'equals':
        if (responseValue !== value) return false;
        break;
      case 'does_not_equal':
        if (responseValue === value) return false;
        break;
      case 'greater_than':
        if (!(responseValue > value)) return false;
        break;
      case 'less_than':
        if (!(responseValue < value)) return false;
        break;
      default:
        return false;
    }
  }

  return true;
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
