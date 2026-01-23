let StepBox = require("./StepBox.js")

let ui = $ui.layout('main.xml')
ui.show()

// 幸运id
let BTN_ID_LUCKY = 'com.tencent.mm:id/a3y'
// 返回的id
let BTN_ID_BACK = 'com.tencent.mm:id/actionbar_up_indicator'
// 关闭id
let BTN_ID_CLOSE = 'com.tencent.mm:id/j6f'
// 置顶群id
let BTN_ID_TOP = 'com.tencent.mm:id/a_4'
// 開id
let BTN_ID_KAI = 'com.tencent.mm:id/j6g'
// 開返回id
let BTN_ID_KAI_BACK = 'com.tencent.mm:id/nnc'
// 删除id（不可点击）
let BTN_ID_DEL = 'com.tencent.mm:id/obc'
// 确定删除id
let BTN_ID_DEL_SURE = 'com.tencent.mm:id/mm_alert_ok_btn'

// 选择器
let selectorLucky = $act.selector().id(BTN_ID_LUCKY)
let selectorClose = $act.selector().id(BTN_ID_CLOSE)
let selectorBack = $act.selector().id(BTN_ID_BACK)
let selectorKai = $act.selector().id(BTN_ID_KAI)
let selectorTop = $act.selector().id(BTN_ID_TOP)
let selectorKaiBack = $act.selector().id(BTN_ID_KAI_BACK)
let selectorDel = $act.selector().text('删除').id(BTN_ID_DEL)
let selectorDelSure = $act.selector().id(BTN_ID_DEL_SURE)

// 是否正在运行
let running = false

// 悬浮球名称
let fabName = 'tFab'
// 悬浮球按钮
let menuLogo = null
let menuClose = null
let menuRun = null
let menuLog = null
let menuHome = null

// 线程
let t1 = null
let t1Name = 'loop1'

// 创建存储
let storage = $storage.create('Liang2uv@qianghongbao')
let storageSettingKey = 'setting'

// 设置参数
let settingData = {
    luckyDur: 200,
    luckyTime: 1000,
    luckySleep: 100,
    kaiDur: 50,
    kaiTime: 80,
    kaiSleep: 2000,
    kaiBackDur: 500,
    kaiBackTime: 6,
    kaiBackSleep: 1000,
    closeDur: 500,
    closeTime: 6,
    closeSleep: 1000,
    delPressDur: 500,
    delPressTime: 6,
    delPressSleep: 1000,
    delDur: 500,
    delTime: 6,
    delSleep: 1000,
    delSureDur: 500,
    delSureTime: 6,
    delSureSleep: 1000,
    backDur: 500,
    backTime: 6,
    backSleep: 1000,
    topDur: 500,
    topTime: 6,
    topSleep: 1000
}

/**
 * 获取数字
 */
function getNumber(val, def) {
    const num = Number(val)
    const deft = def ? def : 0
    if (isNaN(num) || num == 0) {
        return deft
    } else {
        return num
    }
}

/**
 * 初始化数据
 */
function initData() {
    let settingStr = storage.getString(storageSettingKey)
    if (settingStr) {
        try {
            const obj = JSON.parse(settingStr)

            settingData.luckyDur = getNumber(obj.luckyDur, 200)
            settingData.luckyTime = getNumber(obj.luckyTime, 1000)
            settingData.luckySleep = getNumber(obj.luckySleep, 100)

            settingData.kaiDur = getNumber(obj.kaiDur, 50)
            settingData.kaiTime = getNumber(obj.kaiTime, 80)
            settingData.kaiSleep = getNumber(obj.kaiSleep, 2000)

            settingData.kaiBackDur = getNumber(obj.kaiBackDur, 500)
            settingData.kaiBackTime = getNumber(obj.kaiBackTime, 6)
            settingData.kaiBackSleep = getNumber(obj.kaiBackSleep, 1000)

            settingData.closeDur = getNumber(obj.closeDur, 500)
            settingData.closeTime = getNumber(obj.closeTime, 6)
            settingData.closeSleep = getNumber(obj.closeSleep, 1000)

            settingData.delPressDur = getNumber(obj.delPressDur, 500)
            settingData.delPressTime = getNumber(obj.delPressTime, 6)
            settingData.delPressSleep = getNumber(obj.delPressSleep, 1000)

            settingData.delDur = getNumber(obj.delDur, 500)
            settingData.delTime = getNumber(obj.delTime, 6)
            settingData.delSleep = getNumber(obj.delSleep, 1000)

            settingData.delSureDur = getNumber(obj.delSureDur, 500)
            settingData.delSureTime = getNumber(obj.delSureTime, 6)
            settingData.delSureSleep = getNumber(obj.delSureSleep, 1000)

            settingData.backDur = getNumber(obj.backDur, 500)
            settingData.backTime = getNumber(obj.backTime, 6)
            settingData.backSleep = getNumber(obj.backSleep, 1000)

            settingData.topDur = getNumber(obj.topDur, 500)
            settingData.topTime = getNumber(obj.topTime, 6)
            settingData.topSleep = getNumber(obj.topSleep, 1000)

        } catch (e) {
            $log.err(e.message)
        }
    }
    storage.putString(storageSettingKey, JSON.stringify(settingData))
}

/**
 * 查找元素线程
 */
function waitFirst(sel, dur, time, callback) {
    let num = 1
    let exists = $thread.hasLoop(t1Name)
    if (exists) {
        $thread.stopLoop(t1Name)
    }
    t1 = $thread.loop(t1Name, () => {
        if (num > time) {
            $thread.stopLoop(t1Name)
            callback(null)
        } else {
            let obj = sel.findFirst()
            if (obj != null) {
                $thread.stopLoop(t1Name)
                callback(obj)
            } else {
                num = num + 1
                sleep(dur)
            }
        }
    })
    t1.start()
}

/**
 * 抢红包
 */
function onLucky(options) {
    waitFirst(selectorLucky,
        settingData.luckyDur,
        settingData.luckyTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $log.warn('红包来了')
                    $act.click(node.cx + 30, node.cy - 30)
                    sleep(settingData.luckySleep)
                    options.success(true)
                } else {
                    options.success(false)
                }
            }
        })
}

/**
 * 点開
 */
function onKai(options) {
    waitFirst(selectorKai,
        settingData.kaiDur,
        settingData.kaiTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $log.err('抢到了')
                    node.click()
                    sleep(settingData.kaiSleep)
                    options.success(true)
                } else {
                    $log.err('没抢到')
                    options.success(false)
                }
            }
        })
}

/**
 * 開后返回
 */
function onKaiBack(options) {
    waitFirst(selectorKaiBack,
        settingData.kaiBackDur,
        settingData.kaiBackTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $log.info('红包返回')
                    node.click()
                    sleep(settingData.kaiBackSleep)
                    options.success(true)
                } else {
                    $act.back();
                    $log.info('没找到红包详情页的返回按钮，执行系统返回！')
                    sleep(settingData.kaiBackSleep)
                    options.success(true)
                }
            }
        })
}

/**
 * 找不到開，找关闭
 */
function onClose(options) {
    waitFirst(selectorClose,
        settingData.closeDur,
        settingData.closeTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $log.info('关闭')
                    node.click()
                    sleep(settingData.closeSleep)
                    options.success(true)
                } else {
                    options.success(false)
                }
            }
        })
}

/**
 * 长按删除
 */
function onDelPress(options) {
    waitFirst(selectorLucky,
        settingData.delPressDur,
        settingData.delPressTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $act.press(node.cx + 30, node.cy - 30, 1500)
                    sleep(settingData.delPressSleep)
                    options.success(true)
                } else {
                    options.success(false)
                }
            }
        })
}

/**
 * 删除
 */
function onDel(options) {
    waitFirst(selectorDel,
        settingData.delDur,
        settingData.delTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $log.info('删除')
                    $act.click(node.cx, node.cy)
                    sleep(settingData.delSleep)
                    options.success(true)
                } else {
                    $log.info('无需删除')
                    options.fail({
                        msg: '没找到删除'
                    })
                }
            }
        })
}

/**
 * 确定删除
 */
function onDelSure(options) {
    waitFirst(selectorDelSure,
        settingData.delSureDur,
        settingData.delSureTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $log.info('确定删除')
                    node.click()
                    sleep(settingData.delSureSleep)
                    options.success(true)
                } else {
                    options.fail({
                        msg: '没找到确定删除'
                    })
                }
            }
        })
}

/**
 * 返回
 */
function onBack(options) {

    waitFirst(selectorBack,
        settingData.backDur,
        settingData.backTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $log.info('群聊返回')
                    node.click()
                    sleep(settingData.backSleep)
                    options.success(true)
                } else {
                    $act.back();
                    $log.info('没找到群聊页的返回按钮，执行系统返回！')
                    sleep(settingData.backSleep)
                    options.success(true)
                }
            }
        })
}

/**
 * 重新进去
 */
function onTop(options) {
    waitFirst(selectorTop,
        settingData.topDur,
        settingData.topTime,
        (node) => {
            if (running == false) {
                options.fail({
                    msg: 'running is false'
                })
            } else {
                if (node != null) {
                    $log.info('进入群聊')
                    node.click()
                    sleep(settingData.topSleep)
                    options.success(true)
                } else {
                    options.fail({
                        msg: '没找到置顶群'
                    })
                }
            }
        })
}

/**
 * 开始报错
 */
function startError(err) {
    if (typeof err == 'string') {
        $log.err('未知异常[1]已暂停：' + err)
        toast('未知异常[1]已暂停')
        menuRun.icon('ic_play_arrow_outline')
        $thread.stopAll()
        $thread.stopAllLoop()
        stop()
    } else {
        if (err && err.msg != 'running is false') {
            $log.err('运行出错：' + err.msg)
            toast('运行出错：' + err.msg)
            menuRun.icon('ic_play_arrow_outline')
            $thread.stopAll()
            $thread.stopAllLoop()
            stop()
        } else if (err && err.msg == 'running is false') {} else {
            $log.err('未知异常[2]已暂停')
            toast('未知异常[2]已暂停')
            menuRun.icon('ic_play_arrow_outline')
            $thread.stopAll()
            $thread.stopAllLoop()
            stop()
        }
    }
}

/**
 * 开始
 */
function start() {
    if (running == false) {
        startError({
            msg: 'running is false'
        })
        return false;
    }
    $log.info('正在抢红包...请不要动屏幕，如果要动屏幕，请先暂停')
    const steps = [
        // 等待
        { func: onLucky, id: 'onLucky' },
        // 打开
        { func: onKai, id: 'onKai' },
        // 关闭过期
        { func: onClose, id: 'onClose', },
        // 返回聊天页面
        { func: onKaiBack, id: 'onKaiBack' },
        // 长按
        {func: onDelPress, id: 'onDelPress'},
        // 删除
        {func: onDel, id: 'onDel'},
        // 确定删除
        {func: onDelSure, id: 'onDelSure'},
        // 返回消息列表
        {func: onBack, id: 'onBack'},
        // 打开置顶群
        {func: onTop, id: 'onTop'},
    ];

    const stepBoxIns = new StepBox(steps);
    stepBoxIns.executeStep({
        // 新一轮
        success: start,
        // 错误展示
        fail: startError,
        // 步骤继续判断
        isContinue: (step, result) => {
            if (step.id === 'onLucky') {
                return result ? 1 : 0;
            } else if (step.id === 'onKai') {
                return result ? 2 : 1;
            } else if (step.id === 'onClose') {
                return result ? 2 : 1;
            } else {
                return 1;
            }
        }
    })
}

/**
 * 结束
 */
function stop() {
    running = false
}

/**
 * 打开参数设置
 */
function openSetting() {
    if (running == true) {
        toast("请先暂停抢红包");
        return
    }

    // 对话框视图
    let uiSetting = $ui.layout("./setting.xml");
    let viewSetting = uiSetting.getView();

    // 获取输入框
    let inputLuckyDur = uiSetting.id('input_luckyDur');
    let inputLuckyTime = uiSetting.id('input_luckyTime');
    let inputLuckySleep = uiSetting.id('input_luckySleep');

    let inputKaiDur = uiSetting.id('input_kaiDur');
    let inputKaiTime = uiSetting.id('input_kaiTime');
    let inputKaiSleep = uiSetting.id('input_kaiSleep');

    let inputKaiBackDur = uiSetting.id('input_kaiBackDur');
    let inputKaiBackTime = uiSetting.id('input_kaiBackTime');
    let inputKaiBackSleep = uiSetting.id('input_kaiBackSleep');

    let inputCloseDur = uiSetting.id('input_closeDur');
    let inputCloseTime = uiSetting.id('input_closeTime');
    let inputCloseSleep = uiSetting.id('input_closeSleep');

    let inputDelPressDur = uiSetting.id('input_delPressDur');
    let inputDelPressTime = uiSetting.id('input_delPressTime');
    let inputDelPressSleep = uiSetting.id('input_delPressSleep');

    let inputDelDur = uiSetting.id('input_delDur');
    let inputDelTime = uiSetting.id('input_delTime');
    let inputDelSleep = uiSetting.id('input_delSleep');

    let inputDelSureDur = uiSetting.id('input_delSureDur');
    let inputDelSureTime = uiSetting.id('input_delSureTime');
    let inputDelSureSleep = uiSetting.id('input_delSureSleep');

    let inputBackDur = uiSetting.id('input_backDur');
    let inputBackTime = uiSetting.id('input_backTime');
    let inputBackSleep = uiSetting.id('input_backSleep');

    let inputTopDur = uiSetting.id('input_topDur');
    let inputTopTime = uiSetting.id('input_topTime');
    let inputTopSleep = uiSetting.id('input_topSleep');

    // 设置输入框的值
    inputLuckyDur.setText(settingData.luckyDur)
    inputLuckyTime.setText(settingData.luckyTime)
    inputLuckySleep.setText(settingData.luckySleep)

    inputKaiDur.setText(settingData.kaiDur)
    inputKaiTime.setText(settingData.kaiTime)
    inputKaiSleep.setText(settingData.kaiSleep)

    inputKaiBackDur.setText(settingData.kaiBackDur)
    inputKaiBackTime.setText(settingData.kaiBackTime)
    inputKaiBackSleep.setText(settingData.kaiBackSleep)

    inputCloseDur.setText(settingData.closeDur)
    inputCloseTime.setText(settingData.closeTime)
    inputCloseSleep.setText(settingData.closeSleep)

    inputDelPressDur.setText(settingData.delPressDur)
    inputDelPressTime.setText(settingData.delPressTime)
    inputDelPressSleep.setText(settingData.delPressSleep)

    inputDelDur.setText(settingData.delDur)
    inputDelTime.setText(settingData.delTime)
    inputDelSleep.setText(settingData.delSleep)

    inputDelSureDur.setText(settingData.delSureDur)
    inputDelSureTime.setText(settingData.delSureTime)
    inputDelSureSleep.setText(settingData.delSureSleep)

    inputBackDur.setText(settingData.backDur)
    inputBackTime.setText(settingData.backTime)
    inputBackSleep.setText(settingData.backSleep)

    inputTopDur.setText(settingData.topDur)
    inputTopTime.setText(settingData.topTime)
    inputTopSleep.setText(settingData.topSleep)

    $tip.show("参数设置", viewSetting, () => {

        // 获取输入框的值
        settingData.luckyDur = getNumber(inputLuckyDur.getText(), 200)
        settingData.luckyTime = getNumber(inputLuckyTime.getText(), 1000)
        settingData.luckySleep = getNumber(inputLuckySleep.getText(), 100)

        settingData.kaiDur = getNumber(inputKaiDur.getText(), 50)
        settingData.kaiTime = getNumber(inputKaiTime.getText(), 80)
        settingData.kaiSleep = getNumber(inputKaiSleep.getText(), 2000)

        settingData.kaiBackDur = getNumber(inputKaiBackDur.getText(), 500)
        settingData.kaiBackTime = getNumber(inputKaiBackTime.getText(), 6)
        settingData.kaiBackSleep = getNumber(inputKaiBackSleep.getText(), 1000)

        settingData.closeDur = getNumber(inputCloseDur.getText(), 500)
        settingData.closeTime = getNumber(inputCloseTime.getText(), 6)
        settingData.closeSleep = getNumber(inputCloseSleep.getText(), 1000)

        settingData.delPressDur = getNumber(inputDelPressDur.getText(), 500)
        settingData.delPressTime = getNumber(inputDelPressTime.getText(), 6)
        settingData.delPressSleep = getNumber(inputDelPressSleep.getText(), 1000)

        settingData.delDur = getNumber(inputDelDur.getText(), 500)
        settingData.delTime = getNumber(inputDelTime.getText(), 6)
        settingData.delSleep = getNumber(inputDelSleep.getText(), 1000)

        settingData.delSureDur = getNumber(inputDelSureDur.getText(), 500)
        settingData.delSureTime = getNumber(inputDelSureTime.getText(), 6)
        settingData.delSureSleep = getNumber(inputDelSureSleep.getText(), 1000)

        settingData.backDur = getNumber(inputBackDur.getText(), 500)
        settingData.backTime = getNumber(inputBackTime.getText(), 6)
        settingData.backSleep = getNumber(inputBackSleep.getText(), 1000)

        settingData.topDur = getNumber(inputTopDur.getText(), 500)
        settingData.topTime = getNumber(inputTopTime.getText(), 6)
        settingData.topSleep = getNumber(inputTopSleep.getText(), 1000)

        // 存入缓存
        storage.putString(storageSettingKey, JSON.stringify(settingData))

        toast("保存成功");
    });
}

/**
 * 创建悬浮按钮
 */
function createFab() {
    $log.info('启动应用')
    if (!$arc.has(fabName)) {
        //创建按钮容器(用来装小按钮)
        let menuBody = $arc.body(fabName) //指定菜单名称

        //创建小按钮
        menuLogo = $arc.item('./res/icon.png') //指定按钮图标
        menuClose = $arc.item('ic_clear_outline').iconTint('#FFFFFF') //可以这样指定样式[方法1]
        menuRun = $arc.item('ic_play_arrow_outline').iconTint('#FFFFFF')
        menuLog = $arc.item('ic_terminal_fill').iconTint('#FFFFFF')
        menuHome = $arc.item('ic_home_fill').iconTint('#FFFFFF')
        menuSetting = $arc.item('ic_settings_fill').iconTint('#FFFFFF')

        // 运行
        menuRun.click(() => {
            let hasPermitIt = $act.hasPermit()
            if (hasPermitIt) {
                if (running) {
                    $log.info('已暂停抢红包')
                    toast('已暂停抢红包')
                    menuRun.icon('ic_play_arrow_outline')
                    $thread.stopAll()
                    $thread.stopAllLoop()
                    stop()
                } else {
                    toast('开始抢红包')
                    menuRun.icon('ic_stop_circle_outline')
                    running = true
                    start()
                }
            } else {
                toast('请先授予“无障碍”权限')
            }
        })

        // 关闭
        menuClose.click(() => {
            $log.info('关闭应用')
            menuRun.icon('ic_play_arrow_outline')
            $thread.stopAll()
            $thread.stopAllLoop()
            stop()
            $arc.closeAll() //或者直接关闭全部的悬浮菜单
            ui.finish()
        })

        // 首页
        menuHome.click(() => {
            $log.info('打开微信')
            $app.launchPkg('com.tencent.mm')
        })

        // 日志
        menuLog.click(() => {
            $log.floaty()
            $log.delete()
            sleep(1000)
            $log.info('使用日志悬浮窗时，请缩小窗口并拖动到右上角，不要遮挡点击操作')
            $log.info('抢红包前：1.置顶群。2.切换到群聊聊天页。3.永不息屏。')
            $log.info('准备好之后请点击“运行”按钮')
        })

        // 设置
        menuSetting.click(() => {
            openSetting()
        })

        //向容器中添加小按钮
        menuBody
            .add(menuLogo) //添加小按钮[主按钮]
            .add(menuHome) //添加小按钮[首页]
            .add(menuSetting) //添加小按钮[设置]
            .add(menuLog) //添加小按钮[日志]
            .add(menuRun) //添加小按钮[运行/停止]
            .add(menuClose) //添加小按钮[关闭]
            .show() //显示
    }
}

/**
 * 权限授予
 */
function checkPerm() {
    let permItCheck = ui.id('perm_it')
    let permItfloat = ui.id('perm_float')
    let permItNotice = ui.id('perm_notice')

    permItCheck.click(() => {
        let hasPermitIt = $act.hasPermit()
        if (!hasPermitIt) {
            $permit.wza()
        } else {
            ui.toast('您已授权', 'top')
        }
    })

    permItfloat.click(() => {
        let hasPermitFloat = $floaty.hasPermit()
        if (!hasPermitFloat) {
            $floaty.getPermit()
        } else {
            ui.toast('您已授权', 'top')
        }
    })

    permItNotice.click(() => {
        ui.toast('请自行到“系统设置-应用管理”中授权', 'top')
    })
}

initData()
createFab()
checkPerm()
