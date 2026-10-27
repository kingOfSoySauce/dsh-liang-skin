import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Switch } from "@deepseek-ai/dsh-client-ui-primitives";
import type { SkinSettings, PreferenceStore } from "./preferences";
import settingsStyles from "./settings-panel.css";
import type { SkinUpdaterStore } from "./updater";
import { UpdateControls } from "./update-controls";

export { settingsStyles };

export const SETTINGS_LOCALES = {
  zh: {
    "settings.title": "滑动变祖",
    "settings.enabled": "启用滑动变祖",
    "settings.enabled.description": "关闭后恢复原生外观，保留其他设置。",
    "settings.group.slider": "滑块",
    "settings.group.visual": "外观",
    "settings.bindEffort": "绑定思考等级",
    "settings.bindEffort.description": "拖动滑块时同步修改模型的推理档位。关闭后只改变外观。",
    "settings.fineStopsEnabled": "31 档细分",
    "settings.fineStopsEnabled.description": "外观可停在 0–30 的每一级；模型仍使用最近的真实推理档位。",
    "settings.hideSlider": "隐藏滑块",
    "settings.hideSlider.description": "隐藏输入框旁的滑块；绑定开启时，外观仍随模型推理档位变化。",
    "settings.maskEnabled": "背景遮罩",
    "settings.maskEnabled.description": "降低人物背景的视觉干扰，保持对话清晰。",
    "settings.xianxiaPortraits": "仙侠风",
    "settings.xianxiaPortraits.description": "切换为仙侠风格人物；不改变其他效果或推理等级。",
    "settings.particlesEnabled": "粒子效果",
    "settings.particlesEnabled.description": "在人物背景上显示装饰粒子。",
    "settings.motionEnabled": "空闲时淡化",
    "settings.motionEnabled.description": "运行或拖动时突出人物，空闲时自动淡化。",
    "settings.failed": "保存失败，设置未更改。请重试。",
  },
  en: {
    "settings.title": "Liang Skin",
    "settings.enabled": "Enable Liang Skin",
    "settings.enabled.description": "Turn off to restore the native appearance and keep your other settings.",
    "settings.group.slider": "Slider",
    "settings.group.visual": "Appearance",
    "settings.bindEffort": "Bind reasoning level",
    "settings.bindEffort.description": "Update the model’s reasoning effort with the slider. Turn off to change appearance only.",
    "settings.fineStopsEnabled": "31 fine stops",
    "settings.fineStopsEnabled.description": "Stop at every visual level from 0–30. The model still uses the nearest actual effort.",
    "settings.hideSlider": "Hide slider",
    "settings.hideSlider.description": "Hide the slider next to the composer. While binding is on, appearance still follows the model’s reasoning effort.",
    "settings.maskEnabled": "Background scrim",
    "settings.maskEnabled.description": "Soften the portrait background to keep conversations readable.",
    "settings.xianxiaPortraits": "Xianxia style",
    "settings.xianxiaPortraits.description": "Use fantasy portraits without changing other effects or reasoning effort.",
    "settings.particlesEnabled": "Particle effects",
    "settings.particlesEnabled.description": "Show decorative particles over the portrait background.",
    "settings.motionEnabled": "Fade while idle",
    "settings.motionEnabled.description": "Bring portraits forward while running or dragging, and fade them while idle.",
    "settings.failed": "Could not save. Settings have not changed. Please try again.",
  },
};

const GROUPS = [
  { title: "settings.group.slider", keys: ["bindEffort", "fineStopsEnabled", "hideSlider"] },
  { title: "settings.group.visual", keys: ["maskEnabled", "xianxiaPortraits", "particlesEnabled", "motionEnabled"] },
] as const;

export interface SettingsPanelProps {
  scope: PreferenceStore;
  updater?: SkinUpdaterStore;
  t: (key: string) => string;
}

/** Independent controls apply and persist immediately; no setting enables the others. */
export function SettingsPanel({ scope, updater, t }: SettingsPanelProps) {
  const snapshot = useSyncExternalStore((listener) => scope.subscribe(listener), () => scope.getSnapshot());
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const change = async (key: keyof SkinSettings, value: boolean) => {
    if (busy.current || !mounted.current) return;
    // Guard synchronously: rapid clicks can precede the disabled re-render.
    busy.current = true;
    setPending(true);
    setFailed(false);
    try {
      if (key === "enabled") await scope.set(value);
      else await scope.update({ [key]: value });
    } catch {
      if (mounted.current) setFailed(true);
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  };

  // The master switch changes visual state only. The page and every option
  // remain available while it is off, without changing the Loader's state.
  return (
    <div className="liang-settings-panel">
      <div className="liang-settings-panel__row liang-settings-panel__master">
        <div className="liang-settings-panel__copy">
          <div className="liang-settings-panel__label">{t("settings.enabled")}</div>
          <p className="liang-settings-panel__description">{t("settings.enabled.description")}</p>
        </div>
        <Switch
          checked={snapshot.enabled}
          disabled={pending}
          label={t("settings.enabled")}
          onChange={(value) => { void change("enabled", value); }}
        />
      </div>
      {updater && <UpdateControls updater={updater} t={t} />}
      {GROUPS.map((group) => (
        <section className="liang-settings-panel__group" key={group.title} aria-label={t(group.title)}>
          <h3 className="liang-settings-panel__heading">{t(group.title)}</h3>
          {group.keys.map((key) => (
            <div className="liang-settings-panel__row" key={key}>
              <div className="liang-settings-panel__copy">
                <div className="liang-settings-panel__label">{t(`settings.${key}`)}</div>
                <p className="liang-settings-panel__description">{t(`settings.${key}.description`)}</p>
              </div>
              <Switch
                checked={snapshot[key]}
                disabled={pending}
                label={t(`settings.${key}`)}
                onChange={(value) => { void change(key, value); }}
              />
            </div>
          ))}
        </section>
      ))}
      {failed && <p className="liang-settings-panel__error" role="alert">{t("settings.failed")}</p>}
    </div>
  );
}
