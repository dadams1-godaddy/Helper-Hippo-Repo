import { spawn }                                 from 'child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join }                                  from 'path';

const HOME         = process.env.HOME ?? '/Users/dadams1';
const SCRIPTS_ROOT = '/Users/dadams1/Desktop/GoDaddy2026/Summer2026/PowerShell/EXO_Audit/Scripts';
const WRAPPER      = `${SCRIPTS_ROOT}/Connect-And-Run.ps1`;

// =============================================================================
// SCRIPT RUNNER
// Spawns pwsh via the Connect-And-Run wrapper.
// onDeviceCode(code) fires when EXO posts the browser auth code to stdout.
// onDone(err) fires when the process exits.
// =============================================================================

function runScript(scriptPath, { onDeviceCode, onDone }) {
  const proc = spawn('pwsh', ['-File', WRAPPER, '-TargetScript', scriptPath], {
    env: process.env
  });

  proc.stdout.on('data', chunk => {
    const text = chunk.toString();
    // Exchange Online device code auth prints: "...enter the code XXXXXXXX to authenticate"
    const match = text.match(/enter the code (\w{8,})\s+to authenticate/i);
    if (match) onDeviceCode?.(match[1]);
  });

  proc.on('close', code => onDone(code !== 0 ? new Error(`Script exited with code ${code}`) : null));
  proc.on('error', err => onDone(err));
}

function runInitialAudit({ onDeviceCode, onDone }) {
  runScript(`${SCRIPTS_ROOT}/Build_Inventory/Build_DL_Inventory.ps1`, { onDeviceCode, onDone });
}

function runSecondaryAudit(auditType, { onDeviceCode, onDone }) {
  const scriptMap = {
    no_members:      `${SCRIPTS_ROOT}/Actions/Nomembers_Audit/Scripts/No_Members_DL_Audit.ps1`,
    recheck:         `${SCRIPTS_ROOT}/Actions/Nomembers_Audit/Scripts/No_Members_DL_Audit_Check.ps1`,
    pull_attributes: `${SCRIPTS_ROOT}/Actions/Nomembers_Audit/Scripts/Get_Attributes_From_NoMembers.ps1`,
    delete_groups:   `${SCRIPTS_ROOT}/Actions/DeleteDLmembers/DeleteMembers.ps1`,
  };
  runScript(scriptMap[auditType], { onDeviceCode, onDone });
}

// =============================================================================
// STATE — tracks the thread anchor and run count per channel
// =============================================================================

const threadState = new Map(); // channelId -> { threadTs, runCount }

function formatTimestamp() {
  return new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
}

function countCsvRows(filePath) {
  if (!existsSync(filePath)) return null;
  const lines = readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(l => l.trim().length > 0);
  return Math.max(0, lines.length - 1); // subtract header row
}

function findLatestReportFolder(reportsDir) {
  if (!existsSync(reportsDir)) return null;
  const dirs = readdirSync(reportsDir)
    .map(name => ({ name, mtime: statSync(join(reportsDir, name)).mtime }))
    .filter(e => statSync(join(reportsDir, e.name)).isDirectory())
    .sort((a, b) => b.mtime - a.mtime);
  return dirs.length > 0 ? join(reportsDir, dirs[0].name) : null;
}

// Known output locations based on your existing audit runs
const AUDIT_PATHS = {
  no_members: {
    reportsDir: join(HOME, 'Desktop/GoDaddy2026/Summer2026/ExchangeOnlineAudit/Inventory/Mass_Inventory/Reports'),
    files: ['NoMembers_Groups.csv', 'NoOwners_OwnerApproval_Groups.csv'],
  },
  recheck: {
    files: [
      join(HOME, 'Desktop/DL_Recheck_MemberCounts_NotSynced.csv'),
      join(HOME, 'Desktop/DL_Recheck_MemberCounts.csv'),
    ],
  },
  pull_attributes: {
    files: [
      join(HOME, 'Desktop/GoDaddy2026/Summer2026/Temp/6_24_26_Member_Pull/Attributes_Output/DL_Attributes_6_22_26.csv'),
    ],
  },
  delete_groups: null,
};

function getAuditSummary(auditType) {
  const config = AUDIT_PATHS[auditType];

  if (!config) {
    return [{ label: 'Deletion complete — verify in Exchange Online admin', count: null }];
  }

  // no_members uses a timestamped Reports folder — find the latest one
  if (config.reportsDir) {
    const latest = findLatestReportFolder(config.reportsDir);
    if (!latest) return [{ label: 'No report folder found', count: null }];
    return config.files.map(f => ({ label: f, count: countCsvRows(join(latest, f)) }));
  }

  // flat file list
  return config.files.map(f => ({
    label: f.split('/').pop(),
    count: countCsvRows(f)
  }));
}

// =============================================================================
// CONSTANTS
// =============================================================================

const AUDIT_OPTIONS = [
  {
    text:        { type: 'plain_text', text: ':mag:  No Members / No Owners Audit' },
    description: { type: 'plain_text', text: 'Flags M365 and mail groups with zero members or no valid owners' },
    value: 'no_members'
  },
  {
    text:        { type: 'plain_text', text: ':repeat:  Recheck Empty Groups' },
    description: { type: 'plain_text', text: 'Re-verifies groups previously flagged as empty to confirm current state' },
    value: 'recheck'
  },
  {
    text:        { type: 'plain_text', text: ':clipboard:  Pull Group Attributes' },
    description: { type: 'plain_text', text: 'Pulls full attribute detail from flagged groups for review before any action' },
    value: 'pull_attributes'
  },
  {
    text:        { type: 'plain_text', text: ':warning:  Delete Empty Groups' },
    description: { type: 'plain_text', text: 'Removes groups from deletion CSV — destructive, requires approval to execute' },
    value: 'delete_groups'
  },
];

const AUDIT_LABELS = {
  no_members:      'No Members / No Owners Audit',
  recheck:         'Recheck Empty Groups',
  pull_attributes: 'Pull Group Attributes',
  delete_groups:   'Delete Empty Groups',
};

// =============================================================================
// BLOCKS / VIEWS
// =============================================================================

function buildAuditCompleteMessage() {
  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: ':white_check_mark:  DL Inventory Build Complete' }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'The full Exchange Online DL/Security Group inventory has been built.\nSelect a follow-up audit to run against the new inventory.'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Select Audit' },
          action_id: 'open_audit_modal',
          style: 'primary'
        }
      ]
    }
  ];
}

function buildAuditModal(metadata) {
  return {
    type: 'modal',
    callback_id: 'submit_audit_selection',
    private_metadata: metadata,
    title:  { type: 'plain_text', text: 'Run Follow-up Audit' },
    submit: { type: 'plain_text', text: 'Run Audit' },
    close:  { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'Choose which audit to run against the inventory CSV:' }
      },
      {
        type: 'input',
        block_id: 'audit_type_block',
        label: { type: 'plain_text', text: 'Audit Type' },
        element: {
          type: 'radio_buttons',
          action_id: 'audit_type_select',
          options: AUDIT_OPTIONS
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: ':warning: *Delete Empty Groups* is destructive. Results will require admin approval before any groups are removed.'
          }
        ]
      }
    ]
  };
}

function buildAuditResultsBlocks(auditType, label, runNum, startedAt, completedAt, summary) {
  const outputLines = summary.map(s =>
    s.count !== null
      ? `:page_facing_up: \`${s.label}\` — *${s.count} row${s.count !== 1 ? 's' : ''}*`
      : `:page_facing_up: ${s.label}`
  ).join('\n');

  const deleteWarning = auditType === 'delete_groups'
    ? '\n\n:warning: *Approve only if you have verified the deletion CSV and confirmed groups should be removed.*'
    : '';

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: `:clipboard:  ${label} — Run #${runNum}` }
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `:clock1: *Started:* ${startedAt}` },
        { type: 'mrkdwn', text: `:white_check_mark: *Completed:* ${completedAt}` }
      ]
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Output Files:*\n${outputLines}${deleteWarning}` }
    },
    { type: 'divider' },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: ':white_check_mark: Approve' },
          action_id: 'approve_audit',
          style: 'primary'
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: ':x: Deny' },
          action_id: 'deny_audit',
          style: 'danger'
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: ':eyes: Flag for Review' },
          action_id: 'flag_audit'
        }
      ]
    }
  ];
}

function buildDenyModal(metadata) {
  return {
    type: 'modal',
    callback_id: 'submit_audit_deny',
    private_metadata: metadata,
    title:  { type: 'plain_text', text: 'Deny Audit Results' },
    submit: { type: 'plain_text', text: 'Confirm Deny' },
    close:  { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: 'Provide a reason for denying these audit results.' }
      },
      {
        type: 'input',
        block_id: 'deny_reason_block',
        optional: true,
        label: { type: 'plain_text', text: 'Reason (optional)' },
        element: {
          type: 'plain_text_input',
          action_id: 'deny_reason_input',
          multiline: true,
          placeholder: { type: 'plain_text', text: 'Describe any issues or concerns...' }
        }
      }
    ]
  };
}

// =============================================================================
// HELPERS
// =============================================================================

async function updateMessageWithStatus(client, channelId, messageTs, statusBlock) {
  const history = await client.conversations.history({
    channel: channelId,
    latest: messageTs,
    inclusive: true,
    limit: 1
  });

  const currentBlocks = history.messages[0]?.blocks?.filter(b => b.type !== 'actions') ?? [];

  await client.chat.update({
    channel: channelId,
    ts: messageTs,
    blocks: [...currentBlocks, statusBlock],
    text: statusBlock.text?.text ?? 'Audit status updated'
  });
}

// =============================================================================
// COMMAND + ACTIONS
// =============================================================================

export function audit(app) {

  // ---------------------------------------------------------------------------
  // /run-audit — starts the DL inventory build (the 8-hour initial audit)
  // ---------------------------------------------------------------------------
  app.command('/run-audit', async ({ ack, body, client }) => {
    await ack();

    const channelId = body.channel_id;

    const startedAt = formatTimestamp();

    const anchorMsg = await client.chat.postMessage({
      channel: channelId,
      text: `:hourglass_flowing_sand: *DL Inventory Build started* — ${startedAt}\nThis pull retrieves all mail-enabled distribution and security groups from Exchange Online. I'll notify you here when it's complete (approx. 8 hours).`
    });

    threadState.set(channelId, { threadTs: anchorMsg.ts, runCount: 0 });

    runInitialAudit({
      onDeviceCode: async (code) => {
        const state = threadState.get(channelId);
        await client.chat.postMessage({
          channel: channelId,
          thread_ts: state?.threadTs,
          text: `:key: *Exchange Online sign-in required.*\nGo to *https://microsoft.com/devicelogin* and enter code: \`${code}\``
        });
      },
      onDone: async (err) => {
        const state = threadState.get(channelId);
        const threadTs = state?.threadTs;

        if (err) {
          await client.chat.postMessage({
            channel: channelId,
            thread_ts: threadTs,
            text: `:x: DL Inventory Build failed: ${err.message}`
          });
          return;
        }

        await client.chat.postMessage({
          channel: channelId,
          thread_ts: threadTs,
          text: ':white_check_mark: Inventory build complete — select a follow-up audit to run.',
          blocks: buildAuditCompleteMessage()
        });
      }
    });
  });

  // ---------------------------------------------------------------------------
  // /load-audit — skips the 8-hour build and uses the most recent existing data
  // ---------------------------------------------------------------------------
  app.command('/load-audit', async ({ ack, body, client }) => {
    await ack();

    const channelId = body.channel_id;

    // Find the most recent existing report to show which run we're loading
    const latest = findLatestReportFolder(AUDIT_PATHS.no_members.reportsDir);
    const runLabel = latest ? latest.split('/').pop() : 'existing data';

    const anchorMsg = await client.chat.postMessage({
      channel: channelId,
      text: `:file_folder: Loading existing audit data from *${runLabel}*...`
    });

    threadState.set(channelId, { threadTs: anchorMsg.ts, runCount: 0 });

    await client.chat.postMessage({
      channel: channelId,
      thread_ts: anchorMsg.ts,
      text: ':white_check_mark: Existing inventory loaded — select a follow-up audit to run.',
      blocks: buildAuditCompleteMessage()
    });
  });

  // ---------------------------------------------------------------------------
  // "Select Audit" button — opens the audit selection modal
  // ---------------------------------------------------------------------------
  app.action('open_audit_modal', async ({ ack, body, client }) => {
    await ack();

    const channelId = body.channel.id;
    const state = threadState.get(channelId);
    const threadTs = state?.threadTs;

    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildAuditModal(JSON.stringify({ channelId, threadTs }))
    });
  });

  // ---------------------------------------------------------------------------
  // Modal submit — runs the selected secondary audit in the thread
  // ---------------------------------------------------------------------------
  app.view('submit_audit_selection', async ({ ack, body, view, client }) => {
    await ack();

    const { channelId, threadTs } = JSON.parse(view.private_metadata);
    const selected = view.state.values.audit_type_block.audit_type_select.selected_option?.value;
    if (!selected) return;

    const label = AUDIT_LABELS[selected];

    // Increment run counter and stamp the time
    const state = threadState.get(channelId) ?? { threadTs, runCount: 0 };
    state.runCount += 1;
    threadState.set(channelId, state);

    const runNum = state.runCount;
    const startedAt = formatTimestamp();

    await client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text: `:hourglass_flowing_sand: *[Run #${runNum}] ${label}* — Started ${startedAt}`
    });

    runSecondaryAudit(selected, {
      onDeviceCode: async (code) => {
        await client.chat.postMessage({
          channel: channelId,
          thread_ts: threadTs,
          text: `:key: *Exchange Online sign-in required.*\nGo to *https://microsoft.com/devicelogin* and enter code: \`${code}\``
        });
      },
      onDone: async (err) => {
        const completedAt = formatTimestamp();

        if (err) {
          await client.chat.postMessage({
            channel: channelId,
            thread_ts: threadTs,
            text: `:x: *[Run #${runNum}] ${label}* failed at ${completedAt}: ${err.message}`
          });
          return;
        }

        const summary = getAuditSummary(selected);

        await client.chat.postMessage({
          channel: channelId,
          thread_ts: threadTs,
          text: `${label} complete — results ready for review.`,
          blocks: buildAuditResultsBlocks(selected, label, runNum, startedAt, completedAt, summary)
        });
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Approve
  // ---------------------------------------------------------------------------
  app.action('approve_audit', async ({ ack, body, client }) => {
    await ack();
    await updateMessageWithStatus(client, body.channel.id, body.message.ts, {
      type: 'section',
      text: { type: 'mrkdwn', text: `:white_check_mark: *Approved* by <@${body.user.id}>` }
    });
  });

  // ---------------------------------------------------------------------------
  // Deny — opens a modal to capture a reason
  // ---------------------------------------------------------------------------
  app.action('deny_audit', async ({ ack, body, client }) => {
    await ack();
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildDenyModal(JSON.stringify({
        channelId: body.channel.id,
        messageTs: body.message.ts
      }))
    });
  });

  app.view('submit_audit_deny', async ({ ack, body, view, client }) => {
    await ack();

    const { channelId, messageTs } = JSON.parse(view.private_metadata);
    const reason = view.state.values.deny_reason_block.deny_reason_input.value;

    await updateMessageWithStatus(client, channelId, messageTs, {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:x: *Denied* by <@${body.user.id}>${reason ? `\n*Reason:* ${reason}` : ''}`
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Flag for Review
  // ---------------------------------------------------------------------------
  app.action('flag_audit', async ({ ack, body, client }) => {
    await ack();
    await updateMessageWithStatus(client, body.channel.id, body.message.ts, {
      type: 'section',
      text: { type: 'mrkdwn', text: `:eyes: *Flagged for Review* by <@${body.user.id}>` }
    });
  });

}
