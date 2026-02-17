import { describe, it, expect, beforeAll } from 'vitest';
import { AcornAdapter } from '../src/parser/acorn-adapter.js';
import { OxcAdapter } from '../src/parser/oxc-adapter.js';

describe('Parser Error Consistency', () => {
  const acorn = new AcornAdapter();
  const oxc = new OxcAdapter();

  beforeAll(async () => {
    await oxc.init();
  });

  const getError = (adapter: any, code: string, options = {}) => {
    try {
      adapter.parse(code, options);
      return null;
    } catch (err) {
      return err as any;
    }
  };

  it('should provide location info for simple syntax error', () => {
    const code = 'const x = ;';
    const errAcorn = getError(acorn, code);
    const errOxc = getError(oxc, code);

    expect(errAcorn).toBeInstanceOf(SyntaxError);
    expect(errOxc).toBeInstanceOf(SyntaxError);

    // 检查位置信息是否存在 (OXC 我们手动添加了 pos 和 loc)
    expect(errAcorn.pos).toBeDefined();
    expect(errOxc.pos).toBeDefined();

    // 验证位置是否接近 (不同引擎可能对错误的精确 offset 定义略有差异，但通常应在同一位置)
    expect(Math.abs(errAcorn.pos - errOxc.pos)).toBeLessThanOrEqual(1);
  });

  it('should provide multi-line error messages or detailed info for complex errors', () => {
    const code = `function f() {
    const x =
    return x;
    }`;
    const errOxc = getError(oxc, code);

    // OXC 报错通常包含比较详细的上下文
    expect(errOxc.message).toContain('Unexpected token');
  });

  it('should handle TypeScript errors correctly', () => {
    const code = 'const x: number = "hi";';
    // 在不开启 TS 模式时，两者都应抛出语法错误（因为冒号在普通 JS 赋值中非法）
    const errAcorn = getError(acorn, code, { ts: false });
    const errOxc = getError(oxc, code, { ts: false });

    expect(errAcorn).toBeInstanceOf(SyntaxError);
    expect(errOxc).toBeInstanceOf(SyntaxError);
  });
});
