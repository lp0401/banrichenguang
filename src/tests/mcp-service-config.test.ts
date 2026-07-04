import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MCP_OAUTH_URL,
  MCP_PUBLIC_TOOLS,
  MCP_STDIO_GLOBAL_COMMAND,
  MCP_STDIO_PACKAGE_NAME,
  buildMcpOAuthConfig,
  buildMcpStdioGlobalConfig,
  buildMcpStdioNpxConfig,
} from '../lib/mcp-service-config';

test('stdio config snippets match the documented local MCP usage', () => {
  const npxConfig = JSON.parse(buildMcpStdioNpxConfig()) as {
    mcpServers: { 'banri-chenguang': { command: string; args: string[] } };
  };
  const globalConfig = JSON.parse(buildMcpStdioGlobalConfig()) as {
    mcpServers: { 'banri-chenguang': { command: string } };
  };

  assert.deepEqual(npxConfig, {
    mcpServers: {
      'banri-chenguang': {
        command: 'npx',
        args: ['-y', MCP_STDIO_PACKAGE_NAME],
      },
    },
  });
  assert.deepEqual(globalConfig, {
    mcpServers: {
      'banri-chenguang': {
        command: MCP_STDIO_GLOBAL_COMMAND,
      },
    },
  });
});

test('oauth config snippet keeps the remote streamable-http entry', () => {
  const oauthConfig = JSON.parse(buildMcpOAuthConfig()) as {
    mcpServers: { 'banri-chenguang': { type: string; url: string } };
  };

  assert.deepEqual(oauthConfig, {
    mcpServers: {
      'banri-chenguang': {
        type: 'streamable-http',
        url: MCP_OAUTH_URL,
      },
    },
  });
});

test('public MCP tools list stays aligned with the current package README surface', () => {
  const toolIds = MCP_PUBLIC_TOOLS.map((tool) => tool.id);

  assert.equal(MCP_PUBLIC_TOOLS.length, 15);
  assert.deepEqual(toolIds, [
    'bazi',
    'bazi_pillars_resolve',
    'bazi_dayun',
    'ziwei',
    'ziwei_horoscope',
    'ziwei_flying_star',
    'liuyao',
    'meihua',
    'tarot',
    'almanac',
    'astrology',
    'qimen',
    'taiyi',
    'daliuren',
    'xiaoliuren',
  ]);
  assert.equal(toolIds.includes('fortune'), false);
});
