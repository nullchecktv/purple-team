# Hackathon Speed Rules

## 5-Hour Sprint Philosophy

**Ship fast. Cut corners intelligently. Optimize for demo impact.**

You have 5 hours. Every minute counts. These rules override normal best practices.

## Speed Hierarchy

1. **Does it work for the demo?** → Ship it
2. **Does it look good on screen?** → Ship it
3. **Is it perfect code?** → Don't care

## Quick Start

### First Time Setup (Automatic)
When you first ask Kiro to create a feature, if `.env` doesn't exist, Kiro will:
1. Ask you: "Which Lambda runtime do you prefer? (nodejs22.x or python3.13)"
2. Ask you: "What's your name for tracking feature ownership?"
3. Create `.env` file with your preferences
4. Proceed to generate your feature

After that, Kiro remembers your preferences and uses them automatically.

### Working with Kiro - Spec-Driven Development

**CRITICAL: Always use specs for feature development**

When building features, Kiro MUST:
1. Create a spec for the feature (requirements + design + tasks)
2. Execute ALL tasks automatically without stopping
3. Only pause if explicitly told to stop

**Workflow:**
```
User: "Create a feature for user profiles"

Kiro:
1. Creates spec with requirements, design, and tasks
2. Immediately executes all tasks in sequence
3. Generates UI components, Lambda functions, SAM resources
4. Updates template.yaml
5. Shows completion summary

User can review and iterate after completion
```

**DO NOT:**
- ❌ Stop after creating the spec and wait for approval
- ❌ Ask permission to execute each task
- ❌ Pause between tasks unless errors occur

**DO:**
- ✅ Create spec and execute all tasks immediately
- ✅ Show progress as you work through tasks
- ✅ Complete the entire feature in one flow
- ✅ Only stop if user says "stop" or "wait"

### Feature Generation Process
**Before creating any feature, Kiro MUST:**
1. Check if `.env` file exists
2. If NO: Ask runtime preference and team member name, then create `.env`
3. If YES: Read runtime preference from `.env`

**When creating features, Kiro will:**
- Create a spec with requirements, design, and tasks
- Execute all tasks automatically
- Read your `.env` file for runtime preference
- Copy from `examples/functions/` and customize
- Generate UI components with loading states and animations
- Update `template.yaml` automatically
- Wire up API Gateway, DynamoDB permissions, and environment variables

Just say: "Create a feature called [name]" and Kiro handles everything from spec to implementation.

## Hackathon-Specific Overrides

### Skip These Entirely
- ❌ Unit tests (zero tests required)
- ❌ Integration tests
- ❌ Error handling beyond basic try-catch
- ❌ Input validation (trust your own inputs)
- ❌ Logging (only log actual errors)
- ❌ Comments and documentation
- ❌ Code reviews
- ❌ Refactoring
- ❌ Optimization
- ❌ Edge case handling

### Do These Minimally
- ✅ One Lambda function per feature (no splitting)
- ✅ Inline everything (no utils unless used 3+ times)
- ✅ Copy-paste is faster than abstraction
- ✅ Hardcode values if it saves time
- ✅ Use console.log for debugging, delete before commit
- ✅ Single DynamoDB table, simple pk/sk patterns
- ✅ No authentication (add if time permits)

### Focus Here (Priority Order)
1. 🎯 **Visual UX (TOP PRIORITY)** - Stunning, polished UI wins demos
   - Consistent theme colors throughout
   - Smooth animations and transitions
   - Loading states for every async operation
   - Professional spacing and typography
   - Responsive design that looks great
   - Use Tailwind theme utilities (not arbitrary values)
2. 🎯 **Core demo flow** - One happy path that works perfectly
3. 🎯 **AWS service showcase** - Use interesting services visibly
4. 🎯 **Kiro integration** - Show AI-assisted development

## Team Coordination

### Work Stream Rules
- **5 people = 5 full-stack features**
- **Each person owns**: UI + Backend + Infrastructure for their feature
- **Self-contained**: No dependencies between features until final integration
- **Communicate in chat**, not in code

### Full-Stack Feature Streams
Each person builds one complete vertical slice:

1. **Feature A** - Complete feature (React UI + Lambda + SAM resources)
2. **Feature B** - Complete feature (React UI + Lambda + SAM resources)
3. **Feature C** - Complete feature (React UI + Lambda + SAM resources)
4. **Feature D** - Complete feature (React UI + Lambda + SAM resources)
5. **Feature E** - Complete feature (React UI + Lambda + SAM resources)

### Feature Ownership Pattern
Each developer owns:
- ✅ React component(s) for their feature
- ✅ Lambda function(s) for their feature
- ✅ SAM template resources for their feature
- ✅ End-to-end testing of their feature
- ✅ Demo script for their feature

### Communication Protocol
- **Shared SAM template**: Merge resources as you build
- **Shared frontend**: Each person owns their route/component
- **API contracts**: Document your endpoints in shared doc
- **Slack/Discord**: Real-time coordination
- **No meetings**: Async only
- **Blockers**: Shout immediately, don't wait

## Code Standards (Minimal)

### Lambda Functions (Node.js)
```javascript
export const handler = async (event) => {
  try {
    // Do the thing
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
```

### Lambda Functions (Python)
```python
import json
import os

def lambda_handler(event, context):
    try:
        # Do the thing
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

### DynamoDB Operations (Node.js)
```javascript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// Put item
await ddb.send(new PutCommand({
  TableName: process.env.TABLE_NAME,
  Item: { pk: id, sk: 'data', ...data }
}));

// Query items
const result = await ddb.send(new QueryCommand({
  TableName: process.env.TABLE_NAME,
  KeyConditionExpression: 'pk = :pk',
  ExpressionAttributeValues: { ':pk': id }
}));
```

### DynamoDB Operations (Python)
```python
# Just use boto3 directly, no wrappers
import boto3
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

table.put_item(Item={'pk': id, 'sk': 'data', **data})
```

### Frontend Components
```typescript
// Inline everything, no prop drilling
export default function Feature() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);

  return <div>{/* render */}</div>;
}
```

## AWS Service Showcase

### Pick 2-3 Impressive Services
- **Bedrock** - AI/ML always impresses
- **Step Functions** - Visual workflows look great
- **EventBridge** - Event-driven architecture
- **DynamoDB Streams** - Real-time data
- **Lambda** - Obviously
- **S3** - File storage/uploads

### Avoid These (Too Complex)
- ❌ VPC networking
- ❌ Custom domains
- ❌ CloudFront distributions
- ❌ Cognito (unless auth is core feature)
- ❌ Multiple regions
- ❌ Complex IAM policies

## Infrastructure as Code

### Mandatory: Use SAM Only
- **Everyone uses SAM** - No CDK, no Terraform, no mixing tools
- **One template.yaml** - All resources in one file
- **Merge as you go** - Add your Lambda functions to shared template
- **Deploy from one machine** - Designate one person as deployer

### Why SAM Only?
- ✅ Faster for serverless (less boilerplate)
- ✅ Simpler syntax (YAML is easy to merge)
- ✅ Better API Gateway integration
- ✅ Local testing with `sam local`
- ✅ No build step (CDK requires synth)
- ✅ No time wasted on IaC integration issues

### Runtime Support
- **Node.js**: `Runtime: nodejs22.x` for `.mjs` files
- **Python**: `Runtime: python3.13` for `.py` files
- **Mix freely**: Each Lambda can use different runtime

## Deployment Strategy

### Deploy Early, Deploy Often
- **Hour 1**: Deploy base SAM template with shared resources
- **Hour 2**: Each person deploys their first Lambda
- **Hour 3**: Deploy frontend to S3
- **Hour 4**: Full integration deployed
- **Hour 5**: Final polish and demo prep

### Base SAM Template (Start Here)
The base template is already set up in `backend/template.yaml`. It includes:
- HttpApi with CORS configured
- Shared DynamoDB table with pk/sk keys
- esbuild configuration for Node.js functions
- Global environment variables (TABLE_NAME, API_URL)

When adding functions, use these patterns:

**Node.js Function:**
```yaml
MyNodeFunction:
  Type: AWS::Serverless::Function
  Metadata:
    BuildMethod: esbuild
    BuildProperties:
      <<: *esbuild-properties
      EntryPoints:
        - index.mjs
  Properties:
    Runtime: nodejs22.x
    Handler: index.handler
    CodeUri: my-feature/
    Policies:
      - Statement:
          - Effect: Allow
            Action:
              - dynamodb:Query
            Resource: !GetAtt DataTable.Arn
    Events:
      Api:
        Type: HttpApi
        Properties:
          ApiId: !Ref HttpApi
          Path: /my-feature
          Method: get
```

**Python Function:**
```yaml
MyPythonFunction:
  Type: AWS::Serverless::Function
  Properties:
    Runtime: python3.13
    Handler: app.lambda_handler
    CodeUri: my-feature/
    Policies:
      - Statement:
          - Effect: Allow
            Action:
              - dynamodb:PutItem
            Resource: !GetAtt DataTable.Arn
    Events:
      Api:
        Type: HttpApi
        Properties:
          ApiId: !Ref HttpApi
          Path: /my-feature
          Method: post
```

### Kiro Setup Flow (Automatic)

**IMPORTANT: Before generating ANY Lambda function, Kiro MUST:**

1. **Check for `.env` file**
   ```
   If .env does NOT exist:
     - Ask: "Which Lambda runtime do you prefer? (nodejs22.x or python3.13)"
     - Ask: "What's your name for tracking feature ownership?"
     - Create .env file with:
       LAMBDA_RUNTIME=[their choice]
       TEAM_MEMBER=[their name]
       AWS_REGION=us-east-1
       AWS_PROFILE=default
       STACK_NAME=hackathon-demo
     - Confirm: "Created .env with your preferences. Proceeding with [runtime]..."

   If .env EXISTS:
     - Read LAMBDA_RUNTIME value
     - Use that runtime silently
   ```

2. **Generate feature based on runtime**
   - If nodejs22.x: Copy from `examples/functions/resourceTypeB/`
   - If python3.13: Copy from `examples/functions/resourceTypeA/`

### Adding Your Feature
1. Tell Kiro: "Create a new feature called [feature-name]"
2. Kiro checks/creates `.env` (first time only)
3. Kiro copies from correct example and customizes
4. Review the generated code and SAM template updates
5. Commit and let deployer run `sam build && sam deploy`

### Example Kiro Commands
- "Create a new feature called user-profile"
- "Add a Lambda function for image-processing"
- "Generate a new API endpoint for notifications"

Kiro will automatically:
- Check/create `.env` for runtime preference
- Copy the correct example (Node.js or Python)
- Update template.yaml with your function
- Create the function folder with starter code
- Wire up API Gateway events

## UI/UX Standards (CRITICAL FOR DEMOS)

### Visual Polish Requirements
**Every component MUST have:**
- ✅ Loading states with spinners/skeletons
- ✅ Smooth transitions (transition-all duration-200)
- ✅ Hover states on interactive elements
- ✅ Consistent spacing using Tailwind scale (p-4, space-y-4, gap-6)
- ✅ Theme colors only (blue-600, gray-100, etc - NO arbitrary colors)
- ✅ Proper contrast for accessibility
- ✅ Empty states with helpful messaging

### Tailwind Theme Usage
```typescript
// GOOD - Uses theme colors and spacing
<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
  Click Me
</button>

// BAD - Arbitrary values break consistency
<button className="px-[23px] py-[11px] bg-[#3B82F6]">
  Click Me
</button>
```

### Animation Patterns
```typescript
// Loading spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />

// Fade in
<div className="animate-fade-in opacity-0">Content</div>

// Slide in
<div className="transform transition-transform duration-300 translate-y-0 hover:-translate-y-1">
  Card
</div>
```

### Component Structure
```typescript
export default function Feature() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.length) return <EmptyState />;

  return (
    <div className="space-y-6">
      {data.map(item => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
          {item.content}
        </Card>
      ))}
    </div>
  );
}
```

## Demo Preparation (Hour 5)

### Must-Haves
- ✅ Visually stunning UI with polish and animations
- ✅ Loading states on every async operation
- ✅ Consistent theme colors throughout
- ✅ One complete user flow that works
- ✅ Clear AWS service usage
- ✅ Kiro usage documented (screenshots/video)
- ✅ 2-minute demo script

### Nice-to-Haves (If Time)
- ⭐ Multiple features
- ⭐ Advanced error handling
- ⭐ Complex animations

### Demo Script Template
```
1. Show the problem (15 seconds)
2. Show the solution (30 seconds)
3. Live demo (60 seconds)
4. Highlight AWS services (15 seconds)
5. Highlight Kiro usage (15 seconds)
6. Q&A (15 seconds)
```

## Kiro Integration Points

### Document These for Judges
- **Code generation**: "Kiro generated 80% of our Lambda functions"
- **Debugging**: "Kiro helped us fix deployment issues in minutes"
- **AWS integration**: "Kiro suggested optimal AWS service patterns"
- **Speed**: "Built in 5 hours with Kiro assistance"

### Capture Evidence
- Screenshots of Kiro conversations
- Before/after code comparisons
- Time saved metrics
- Problem-solving examples

## Time Checkpoints

### Hour 1: Foundation & Feature Assignment
- [ ] Base SAM template with shared resources (DynamoDB, API Gateway)
- [ ] Frontend scaffolded with routing
- [ ] Features assigned to team members
- [ ] Each person deploys their first Lambda

### Hour 2: Feature Development
- [ ] Each person: Lambda function working
- [ ] Each person: API endpoint responding
- [ ] Each person: UI component rendering
- [ ] Each person: Basic data flow working end-to-end

### Hour 3: Feature Completion
- [ ] Each person: Feature fully functional
- [ ] Each person: UI polished and working
- [ ] Each person: Data persisting correctly
- [ ] Team: Features integrated in shared app

### Hour 4: Integration & Polish
- [ ] All features working together
- [ ] Navigation between features smooth
- [ ] Shared data models aligned
- [ ] AWS services clearly visible
- [ ] Kiro usage documented

### Hour 5: Demo Prep
- [ ] Demo script written (each person presents their feature)
- [ ] Practice run completed
- [ ] Backup plan ready
- [ ] Presentation slides (if required)

## Emergency Shortcuts

### If Behind Schedule
1. **Cut features** - One working feature beats three broken ones
2. **Mock data** - Hardcode responses if backend isn't ready
3. **Simplify UI** - Plain HTML beats broken React
4. **Skip deployment** - Demo from localhost if needed
5. **Use templates** - Copy working code from examples

### If Ahead of Schedule
1. **Add visual polish** - Animations, better styling
2. **Add error handling** - Make it more robust
3. **Add features** - Expand the demo
4. **Improve presentation** - Better slides, better story
5. **Test edge cases** - Make sure demo won't break

## Success Criteria

### Minimum Viable Demo
- ✅ Works on screen during presentation
- ✅ Shows AWS services clearly
- ✅ Demonstrates Kiro usage
- ✅ Solves a clear problem
- ✅ Looks professional

### Winning Demo
- 🏆 Impressive visual design
- 🏆 Novel use of AWS services
- 🏆 Clear business value
- 🏆 Smooth, confident presentation
- 🏆 Strong Kiro integration story

## Final Checklist

### Before Demo
- [ ] Application deployed and accessible
- [ ] Demo data loaded
- [ ] Demo script memorized
- [ ] Backup plan ready (screenshots/video)
- [ ] Kiro usage documented
- [ ] AWS services highlighted
- [ ] Team roles clear (who presents what)

### During Demo
- [ ] Start with the problem
- [ ] Show the solution working
- [ ] Highlight AWS services used
- [ ] Mention Kiro assistance
- [ ] End with impact/value

### After Demo
- [ ] Answer questions confidently
- [ ] Have technical details ready
- [ ] Explain architecture if asked
- [ ] Discuss challenges overcome

