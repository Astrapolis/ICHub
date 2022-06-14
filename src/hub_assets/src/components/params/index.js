import React, { useContext, createContext, useState } from "react";
import { IDL } from "@dfinity/candid";

const casesValueContext = createContext();

export function useCasesValue() {
    return useContext(casesValueContext);
}


function makeRecordTypeTemplateValue(argIDL, rootObject) {
    argIDL._fields.forEach((field, index) => {
        let fieldName = field[0];
        let fieldIDL = field[1];
        rootObject[fieldName] = gothroughArgType(fieldIDL);
    });
    return rootObject;
}
function gothroughArgType(argIDL) {
    if (argIDL instanceof IDL.PrimitiveType) {
        return undefined;
    }
    if (argIDL instanceof IDL.RecordClass) {
        let subObject = {};
        return makeRecordTypeTemplateValue(argIDL, subObject);
    }
    if (argIDL instanceof IDL.VecClass) {
        return [];
    }
}

function constructMethodParamValueObjectTemplate(methodIDL) {
    if (methodIDL.argTypes.length === 0) {
        return;
    }
    let valueTemplate = [];

    methodIDL.argTypes.forEach((argIDL, index) => {
        valueTemplate[index] = gothroughArgType(argIDL);
    });

    return valueTemplate;

}

export function usePrivdeCasesValue() {
    const [casesMethodIDL, setCaseMethodIDL] = useState({});
    const [casesValue, setCasesValue] = useState({});

    const registerCaseValue = (uuid, methodIDL, caseValue) => {
        console.log('register cv ====>', uuid);
        casesMethodIDL[uuid] = methodIDL;
        if (caseValue !== undefined) {
            casesValue[uuid] = caseValue;
        } else {
            let initValue = constructMethodParamValueObjectTemplate(methodIDL);
            console.log('init value', initValue);
            casesValue[uuid] = initValue;
        }
        console.log('casesValue after register =====>', casesValue, caseValue);
        setCaseMethodIDL({ ...casesMethodIDL });
        setCasesValue({ ...casesValue });
    };

    const unregisterCaseValue = (uuid) => {
        console.log('unregister cv ====>', uuid);
        if (casesMethodIDL[uuid]) {
            delete casesMethodIDL[uuid];
            setCaseMethodIDL({ ...casesMethodIDL });
        }
        if (casesValue[uuid] !== undefined) {
            delete casesValue[uuid];
            setCasesValue({ ...casesValue });
        }
    };
    const clearCaseValue = () => {
        console.log('clear case value');
        setCaseMethodIDL({});
        setCasesValue({});
    }
    const setValueAtPathes = (rootObject, pathes, value) => {
        console.log("setValueAtPathes", rootObject, pathes, value);
        let ref = rootObject;
        let lastKey = pathes.pop();
        pathes.forEach(path => {
            if (Array.isArray(ref)) {
                ref = ref[parseInt(path)];
            } else {
                ref = ref[path];
            }
            console.log('round ', path, ref);
        });
        if (Array.isArray(ref)) {
            console.log('ref is array');
            ref[parseInt(lastKey)] = value;
        } else {
            ref[lastKey] = value;
        }
        console.log('result',ref, rootObject);
    }

    function setValueObjectByPathes(rootObject, pathes, newValue) {
        let ref = rootObject;
        let refV = newValue;
        let lastKey = pathes.pop();
        pathes.forEach(path => {
            if (Array.isArray(ref)) {
                ref = ref[parseInt(path)];
                refV = refV[parseInt(path)];
            } else {
                ref = ref[path];
                refV = refV[path];
            }
        });
        if (Array.isArray(ref)) {
            ref[parseInt(lastKey)] = newValue[parseInt(lastKey)];
        } else {
            ref[lastKey] = newValue[lastKey];
        }

    }

    function unsetValueObjectByPathes(rootObject, pathes) {
        let ref = rootObject;
        let lastKey = pathes.pop();
        pathes.forEach(path => {
            if (Array.isArray(ref)) {
                ref = ref[parseInt(path)];
            } else {
                ref = ref[path];
            }
        });

        if (Array.isArray(ref)) {
            ref.splice(lastKey, 1);
        } else {
            if (typeof ref === 'object' && ref !== null) {
                if (Object.prototype.hasOwnProperty.call(ref, lastKey)) {
                    delete ref[lastKey];
                }
            } else {
                ref[lastKey] = undefined;
            }
        }
    }

    function getValueObjectByPathes(rootObject, pathes) {

        let ref = rootObject;
        let lastKey = pathes.pop();
        pathes.forEach(path => {
            if (Array.isArray(ref)) {
                ref = ref[parseInt(path)];
            } else {
                ref = ref[path];
            }
        });
        return ref[lastKey];
    }

    const updateRootObject = (uuid, paramIndex, rootObject) => {
        if(Array.isArray(rootObject)) {
            casesValue[uuid].splice(paramIndex, 1, [...rootObject]);
        } else {
            casesValue[uuid].splice(paramIndex, 1, { ...rootObject });
        }
    }

    /**
     * argPath format: <uuid>/<index in FuncClass>/(<arrayIndex|fieldName>)*
     * [] means optional, () means group, * occurence
     * @param {*} argPath
     * @param {*} value 
     */
    const updateParamValue = (argPath, valueObject) => {
        console.log('update value ', argPath, valueObject);
        let pathes = argPath.split('/');
        let uuid = pathes[0];
        let paramIndex = pathes[1];
        let rawValue = valueObject[uuid][paramIndex];
        let rootObject = casesValue[uuid][paramIndex];
        pathes.splice(0, 2);
        if (pathes.length === 0) {
            casesValue[uuid].splice(paramIndex, 1, rawValue);

        } else {
            setValueObjectByPathes(rootObject, pathes, rawValue);
            // casesValue[uuid].splice(paramIndex, 1, { ...rootObject });
            updateRootObject(uuid, paramIndex, rootObject);
        }
        casesValue[uuid] = [...casesValue[uuid]];
        setCasesValue({ ...casesValue });
    }

    const addParamValue = (argPath, argIDL) => {
        let pathes = argPath.split('/');
        let uuid = pathes[0];
        let paramIndex = pathes[1];
        let rootObject = casesValue[uuid][paramIndex];
        let templateValue = gothroughArgType(argIDL);
        pathes.splice(0, 2);
        setValueAtPathes(rootObject, pathes, templateValue);
        
        // casesValue[uuid].splice(paramIndex, 1, { ...rootObject });
        updateRootObject(uuid, paramIndex, rootObject);
        casesValue[uuid] = [...casesValue[uuid]];
        console.log('after add', casesValue);
        setCasesValue({ ...casesValue });
    }

    const removeParamValue = (argPath) => {
        let pathes = argPath.split('/');
        let uuid = pathes[0];
        let paramIndex = pathes[1];
        let rootObject = casesValue[uuid][paramIndex];
        pathes.splice(0, 2);
        unsetValueObjectByPathes(rootObject, pathes);
        // casesValue[uuid].splice(paramIndex, 1, { ...rootObject });
        updateRootObject(uuid, paramIndex, rootObject);
        casesValue[uuid] = [...casesValue[uuid]];
        setCasesValue({ ...casesValue });
    }

    const getParamValue = (argPath) => {
        console.log('getParamValue by path ', argPath, casesValue);
        let pathes = argPath.split('/');
        let uuid = pathes[0];
        let paramIndex = pathes[1];
        let rootObject = casesValue[uuid][paramIndex];
        pathes.splice(0, 2);
        if (pathes.length === 0) {
            console.log('get param root value', rootObject);
            return rootObject
        } else {
            let p =  getValueObjectByPathes(rootObject, pathes);
            console.log('get param child value', p);
            return p;
        }
    }

    return {
        casesValue,
        registerCaseValue,
        unregisterCaseValue,
        clearCaseValue,
        addParamValue,
        updateParamValue,
        removeParamValue,
        getParamValue
    }
}

export const ProvideCasesValue = ({ children }) => {
    const casesValue = usePrivdeCasesValue();
    return (
        <casesValueContext.Provider value={casesValue}>
            {children}
        </casesValueContext.Provider>
    );
}
