/**
 * 简易状态机
 */
function StepBox(steps) {
    this.steps = steps;
    this.currentStep = 0;

    this.executeStep = function (options) {
        if (this.currentStep >= this.steps.length) {
            options.success();
            return;
        }
        
        let step = this.steps[this.currentStep];
        step.func({
            success: (result) => {
                // 判断是否需要继续进行下一步
                const addStep = options.isContinue(step, result)
                if (addStep) {
                    this.currentStep = this.currentStep + addStep;
                    this.executeStep(options);
                } else {
                    options.success()
                }
            },
            fail: options.fail
        });
    }
}

// 导出类
StepBox;