import {
  __commonJS
} from "./chunk-PR4QN5HX.js";

// node_modules/react-refresh/cjs/react-refresh-runtime.development.js
var require_react_refresh_runtime_development = __commonJS({
  "node_modules/react-refresh/cjs/react-refresh-runtime.development.js"(exports) {
    "use strict";
    (function() {
      function computeFullKey(signature) {
        if (null !== signature.fullKey) return signature.fullKey;
        var fullKey = signature.ownKey;
        try {
          var hooks = signature.getCustomHooks();
        } catch (err) {
          return signature.forceReset = true, signature.fullKey = fullKey;
        }
        for (var i = 0; i < hooks.length; i++) {
          var hook = hooks[i];
          if ("function" !== typeof hook)
            return signature.forceReset = true, signature.fullKey = fullKey;
          hook = allSignaturesByType.get(hook);
          if (void 0 !== hook) {
            var nestedHookKey = computeFullKey(hook);
            hook.forceReset && (signature.forceReset = true);
            fullKey += "\n---\n" + nestedHookKey;
          }
        }
        return signature.fullKey = fullKey;
      }
      function resolveFamily(type) {
        return updatedFamiliesByType.get(type);
      }
      function cloneMap(map) {
        var clone = /* @__PURE__ */ new Map();
        map.forEach(function(value, key) {
          clone.set(key, value);
        });
        return clone;
      }
      function cloneSet(set) {
        var clone = /* @__PURE__ */ new Set();
        set.forEach(function(value) {
          clone.add(value);
        });
        return clone;
      }
      function getProperty(object, property) {
        try {
          return object[property];
        } catch (err) {
        }
      }
      function register(type, id) {
        if (!(null === type || "function" !== typeof type && "object" !== typeof type || allFamiliesByType.has(type))) {
          var family = allFamiliesByID.get(id);
          void 0 === family ? (family = { current: type }, allFamiliesByID.set(id, family)) : pendingUpdates.push([family, type]);
          allFamiliesByType.set(type, family);
          if ("object" === typeof type && null !== type)
            switch (getProperty(type, "$$typeof")) {
              case REACT_FORWARD_REF_TYPE:
                register(type.render, id + "$render");
                break;
              case REACT_MEMO_TYPE:
                register(type.type, id + "$type");
            }
        }
      }
      function setSignature(type, key) {
        var forceReset = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : false, getCustomHooks = 3 < arguments.length ? arguments[3] : void 0;
        allSignaturesByType.has(type) || allSignaturesByType.set(type, {
          forceReset,
          ownKey: key,
          fullKey: null,
          getCustomHooks: getCustomHooks || function() {
            return [];
          }
        });
        if ("object" === typeof type && null !== type)
          switch (getProperty(type, "$$typeof")) {
            case REACT_FORWARD_REF_TYPE:
              setSignature(type.render, key, forceReset, getCustomHooks);
              break;
            case REACT_MEMO_TYPE:
              setSignature(type.type, key, forceReset, getCustomHooks);
          }
      }
      function collectCustomHooksForSignature(type) {
        type = allSignaturesByType.get(type);
        void 0 !== type && computeFullKey(type);
      }
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_MEMO_TYPE = Symbol.for("react.memo"), PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, allFamiliesByID = /* @__PURE__ */ new Map(), allFamiliesByType = new PossiblyWeakMap(), allSignaturesByType = new PossiblyWeakMap(), updatedFamiliesByType = new PossiblyWeakMap(), pendingUpdates = [], helpersByRendererID = /* @__PURE__ */ new Map(), helpersByRoot = /* @__PURE__ */ new Map(), mountedRoots = /* @__PURE__ */ new Set(), failedRoots = /* @__PURE__ */ new Set(), rootElements = "function" === typeof WeakMap ? /* @__PURE__ */ new WeakMap() : null, isPerformingRefresh = false;
      exports._getMountedRootCount = function() {
        return mountedRoots.size;
      };
      exports.collectCustomHooksForSignature = collectCustomHooksForSignature;
      exports.createSignatureFunctionForTransform = function() {
        var savedType, hasCustomHooks, didCollectHooks = false;
        return function(type, key, forceReset, getCustomHooks) {
          if ("string" === typeof key)
            return savedType || (savedType = type, hasCustomHooks = "function" === typeof getCustomHooks), null == type || "function" !== typeof type && "object" !== typeof type || setSignature(type, key, forceReset, getCustomHooks), type;
          !didCollectHooks && hasCustomHooks && (didCollectHooks = true, collectCustomHooksForSignature(savedType));
        };
      };
      exports.getFamilyByID = function(id) {
        return allFamiliesByID.get(id);
      };
      exports.getFamilyByType = function(type) {
        return allFamiliesByType.get(type);
      };
      exports.hasUnrecoverableErrors = function() {
        return false;
      };
      exports.injectIntoGlobalHook = function(globalObject) {
        var hook = globalObject.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (void 0 === hook) {
          var nextID = 0;
          globalObject.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook = {
            renderers: /* @__PURE__ */ new Map(),
            supportsFiber: true,
            inject: function() {
              return nextID++;
            },
            onScheduleFiberRoot: function() {
            },
            onCommitFiberRoot: function() {
            },
            onCommitFiberUnmount: function() {
            }
          };
        }
        if (hook.isDisabled)
          console.warn(
            "Something has shimmed the React DevTools global hook (__REACT_DEVTOOLS_GLOBAL_HOOK__). Fast Refresh is not compatible with this shim and will be disabled."
          );
        else {
          var oldInject = hook.inject;
          hook.inject = function(injected) {
            var id = oldInject.apply(this, arguments);
            "function" === typeof injected.scheduleRefresh && "function" === typeof injected.setRefreshHandler && helpersByRendererID.set(id, injected);
            return id;
          };
          hook.renderers.forEach(function(injected, id) {
            "function" === typeof injected.scheduleRefresh && "function" === typeof injected.setRefreshHandler && helpersByRendererID.set(id, injected);
          });
          var oldOnCommitFiberRoot = hook.onCommitFiberRoot, oldOnScheduleFiberRoot = hook.onScheduleFiberRoot || function() {
          };
          hook.onScheduleFiberRoot = function(id, root, children) {
            isPerformingRefresh || (failedRoots.delete(root), null !== rootElements && rootElements.set(root, children));
            return oldOnScheduleFiberRoot.apply(this, arguments);
          };
          hook.onCommitFiberRoot = function(id, root, maybePriorityLevel, didError) {
            var helpers = helpersByRendererID.get(id);
            if (void 0 !== helpers) {
              helpersByRoot.set(root, helpers);
              helpers = root.current;
              var alternate = helpers.alternate;
              null !== alternate ? (alternate = null != alternate.memoizedState && null != alternate.memoizedState.element && mountedRoots.has(root), helpers = null != helpers.memoizedState && null != helpers.memoizedState.element, !alternate && helpers ? (mountedRoots.add(root), failedRoots.delete(root)) : alternate && helpers || (alternate && !helpers ? (mountedRoots.delete(root), didError ? failedRoots.add(root) : helpersByRoot.delete(root)) : alternate || helpers || didError && failedRoots.add(root))) : mountedRoots.add(root);
            }
            return oldOnCommitFiberRoot.apply(this, arguments);
          };
        }
      };
      exports.isLikelyComponentType = function(type) {
        switch (typeof type) {
          case "function":
            if (null != type.prototype) {
              if (type.prototype.isReactComponent) return true;
              var ownNames = Object.getOwnPropertyNames(type.prototype);
              if (1 < ownNames.length || "constructor" !== ownNames[0] || type.prototype.__proto__ !== Object.prototype)
                return false;
            }
            type = type.name || type.displayName;
            return "string" === typeof type && /^[A-Z]/.test(type);
          case "object":
            if (null != type)
              switch (getProperty(type, "$$typeof")) {
                case REACT_FORWARD_REF_TYPE:
                case REACT_MEMO_TYPE:
                  return true;
              }
            return false;
          default:
            return false;
        }
      };
      exports.performReactRefresh = function() {
        if (0 === pendingUpdates.length || isPerformingRefresh) return null;
        isPerformingRefresh = true;
        try {
          var staleFamilies = /* @__PURE__ */ new Set(), updatedFamilies = /* @__PURE__ */ new Set(), updates = pendingUpdates;
          pendingUpdates = [];
          updates.forEach(function(_ref) {
            var family = _ref[0];
            _ref = _ref[1];
            var prevType = family.current;
            updatedFamiliesByType.set(prevType, family);
            updatedFamiliesByType.set(_ref, family);
            family.current = _ref;
            prevType.prototype && prevType.prototype.isReactComponent || _ref.prototype && _ref.prototype.isReactComponent ? _ref = false : (prevType = allSignaturesByType.get(prevType), _ref = allSignaturesByType.get(_ref), _ref = void 0 === prevType && void 0 === _ref || void 0 !== prevType && void 0 !== _ref && computeFullKey(prevType) === computeFullKey(_ref) && !_ref.forceReset ? true : false);
            _ref ? updatedFamilies.add(family) : staleFamilies.add(family);
          });
          var update = {
            updatedFamilies,
            staleFamilies
          };
          helpersByRendererID.forEach(function(helpers) {
            helpers.setRefreshHandler(resolveFamily);
          });
          var didError = false, firstError = null, failedRootsSnapshot = cloneSet(failedRoots), mountedRootsSnapshot = cloneSet(mountedRoots), helpersByRootSnapshot = cloneMap(helpersByRoot);
          failedRootsSnapshot.forEach(function(root) {
            var helpers = helpersByRootSnapshot.get(root);
            if (void 0 === helpers)
              throw Error(
                "Could not find helpers for a root. This is a bug in React Refresh."
              );
            failedRoots.has(root);
            if (null !== rootElements && rootElements.has(root)) {
              var element = rootElements.get(root);
              try {
                helpers.scheduleRoot(root, element);
              } catch (err) {
                didError || (didError = true, firstError = err);
              }
            }
          });
          mountedRootsSnapshot.forEach(function(root) {
            var helpers = helpersByRootSnapshot.get(root);
            if (void 0 === helpers)
              throw Error(
                "Could not find helpers for a root. This is a bug in React Refresh."
              );
            mountedRoots.has(root);
            try {
              helpers.scheduleRefresh(root, update);
            } catch (err) {
              didError || (didError = true, firstError = err);
            }
          });
          if (didError) throw firstError;
          return update;
        } finally {
          isPerformingRefresh = false;
        }
      };
      exports.register = register;
      exports.setSignature = setSignature;
    })();
  }
});

// node_modules/react-refresh/runtime.js
var require_runtime = __commonJS({
  "node_modules/react-refresh/runtime.js"(exports, module) {
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_refresh_runtime_development();
    }
  }
});
export default require_runtime();
/*! Bundled license information:

react-refresh/cjs/react-refresh-runtime.development.js:
  (**
   * @license React
   * react-refresh-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=react-refresh_runtime.js.map
