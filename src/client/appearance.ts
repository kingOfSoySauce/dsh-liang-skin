export interface AppearanceSnapshot {
  enabled: boolean;
  bindEffort: boolean;
}

export interface AppearanceScope {
  getSnapshot(): AppearanceSnapshot;
  subscribe(listener: () => void): () => void;
  setBindEffort(enabled: boolean): Promise<void>;
}

export interface AppearancePresenter {
  choose(enabled: boolean): Promise<void>;
}

const NATIVE_APPEARANCE_ROW = '[class*="_cubeRow"]';
const LIANG_APPEARANCE_BUTTON = "liang-appearance-choice";
const LIANG_BINDING_CONTROL = "liang-appearance-binding";
const LIANG_BINDING_INPUT = "liang-appearance-binding__input";

function hasClassSuffix(node: Element, suffix: string) {
  return [...node.classList].some((name) => name.endsWith(suffix));
}

function findAppearanceRow() {
  for (const row of document.querySelectorAll<HTMLElement>(NATIVE_APPEARANCE_ROW)) {
    if (!hasClassSuffix(row, "_cubeRow")) continue;
    // All three native appearance choices are direct button children. Validate
    // the structure as well as the suffix so unrelated cube rows stay alone.
    const nativeButtons = [...row.children].filter(
      (node): node is HTMLButtonElement => node instanceof HTMLButtonElement
        && hasClassSuffix(node, "_themeCube"),
    );
    if (nativeButtons.length < 3) continue;

    let group = row.parentElement;
    while (group !== null && !hasClassSuffix(group, "_group")) {
      group = group.parentElement;
    }
    group ??= row.parentElement;
    if (group !== null) return { row, group, nativeButtons };
  }
  return null;
}

interface MountedAppearance {
  row: HTMLElement;
  group: HTMLElement;
  button: HTMLButtonElement;
  binding: HTMLLabelElement;
  bindingInput: HTMLInputElement;
  handleCustomClick: () => void;
  handleBindingChange: () => void;
}

export function installLiangAppearanceButton(
  scope: AppearanceScope,
  presenter: AppearancePresenter,
  packageId: string,
): () => void {
  let pending = false;
  let disposed = false;
  let mounted: MountedAppearance | null = null;
  const nativeClickHandlers = new Map<HTMLButtonElement, () => void>();

  const unmount = () => {
    for (const [button, handler] of nativeClickHandlers) {
      button.removeEventListener("click", handler, { capture: true });
    }
    nativeClickHandlers.clear();
    if (mounted === null) return;
    mounted.button.removeEventListener("click", mounted.handleCustomClick);
    mounted.bindingInput.removeEventListener("change", mounted.handleBindingChange);
    mounted.button.remove();
    mounted.binding.remove();
    mounted = null;
  };

  const choose = async (enabled: boolean) => {
    if (disposed || pending || scope.getSnapshot().enabled === enabled) return;
    pending = true;
    sync();
    try {
      await presenter.choose(enabled);
    } catch {
      // The preference store remains the source of truth after a failed choice.
    } finally {
      pending = false;
      if (!disposed) sync();
    }
  };

  const createMount = (row: HTMLElement, group: HTMLElement): MountedAppearance => {
    const english = document.documentElement.lang.toLowerCase().startsWith("en");
    const button = document.createElement("button");
    button.className = LIANG_APPEARANCE_BUTTON;
    button.type = "button";
    button.dataset.plugin = packageId;
    button.setAttribute("aria-label", "滑动变祖");

    const icon = document.createElement("span");
    icon.className = "liang-appearance-choice__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "◈";

    const label = document.createElement("span");
    label.className = "liang-appearance-choice__label";
    label.textContent = english ? "Slider" : "滑动变祖";
    button.append(icon, label);
    const handleCustomClick = () => { void choose(true); };
    button.addEventListener("click", handleCustomClick);

    const binding = document.createElement("label");
    binding.className = LIANG_BINDING_CONTROL;
    binding.dataset.plugin = packageId;

    const bindingCopy = document.createElement("span");
    bindingCopy.className = "liang-appearance-binding__copy";
    const bindingLabel = document.createElement("span");
    bindingLabel.className = "liang-appearance-binding__label";
    const bindingText = english ? "Bind slider to reasoning level" : "滑动变祖绑定思考等级";
    bindingLabel.textContent = bindingText;

    const bindingDescription = document.createElement("span");
    bindingDescription.className = "liang-appearance-binding__description";
    bindingDescription.id = "liang-appearance-binding-description";
    bindingDescription.textContent = english
      ? "When off, the slider does not change the reasoning level."
      : "关闭之后滑块不联动思考等级";
    bindingCopy.append(bindingLabel, bindingDescription);

    const bindingInput = document.createElement("input");
    bindingInput.className = LIANG_BINDING_INPUT;
    bindingInput.type = "checkbox";
    bindingInput.setAttribute("role", "switch");
    bindingInput.setAttribute("aria-label", bindingText);
    bindingInput.setAttribute("aria-describedby", bindingDescription.id);
    const updateBinding = async () => {
      if (disposed || pending) return;
      try {
        await scope.setBindEffort(bindingInput.checked);
      } catch {
        // Restore the persisted selection if writing the preference fails.
      } finally {
        if (!disposed) sync();
      }
    };
    const handleBindingChange = () => { void updateBinding(); };
    bindingInput.addEventListener("change", handleBindingChange);
    binding.append(bindingCopy, bindingInput);

    return { row, group, button, binding, bindingInput, handleCustomClick, handleBindingChange };
  };

  const sync = () => {
    if (disposed) return;
    const target = findAppearanceRow();
    if (target === null) {
      unmount();
      return;
    }
    if (mounted !== null && (mounted.row !== target.row || mounted.group !== target.group)) {
      unmount();
    }
    mounted ??= createMount(target.row, target.group);
    const { row, group, button, binding, bindingInput } = mounted;
    if (button.parentElement !== row) row.append(button);

    const snapshot = scope.getSnapshot();
    button.disabled = pending;
    button.setAttribute("aria-pressed", String(snapshot.enabled));
    if (snapshot.enabled) {
      if (binding.parentElement !== group) group.append(binding);
      bindingInput.checked = snapshot.bindEffort;
      bindingInput.setAttribute("aria-checked", String(snapshot.bindEffort));
      bindingInput.disabled = pending;
    } else {
      binding.remove();
    }

    for (const [nativeButton, handler] of nativeClickHandlers) {
      if (target.nativeButtons.includes(nativeButton)) continue;
      nativeButton.removeEventListener("click", handler, { capture: true });
      nativeClickHandlers.delete(nativeButton);
    }
    for (const nativeButton of target.nativeButtons) {
      if (nativeClickHandlers.has(nativeButton)) continue;
      const handleNativeClick = () => { void choose(false); };
      nativeClickHandlers.set(nativeButton, handleNativeClick);
      nativeButton.addEventListener("click", handleNativeClick, { capture: true });
    }
  };

  const observer = new MutationObserver(sync);
  observer.observe(document.body, { childList: true, subtree: true });
  const unsubscribe = scope.subscribe(sync);
  sync();

  return () => {
    if (disposed) return;
    // Mark disposal first: outstanding choices and queued observer callbacks
    // must never attach new controls after the client has been deactivated.
    disposed = true;
    observer.disconnect();
    unsubscribe();
    unmount();
  };
}
