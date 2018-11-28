/**

*/
//% weight=50 color=#cc1280 icon="K" block="酷比特"
namespace kubit {
    let i2cAddr: number // 0x3F: PCF8574A, 0x27: PCF8574
    let BK: number      // backlight control
    let RS: number      // command/data

    /**
     * 舵机控制
     */
    //% blockId="KUBIT_SERVO" block="舵机控制，引脚 %p|角度 %v"
    //% weight=200 blockGap=8
    //% p.defl=AnalogPin.P2 v.defl=90
    export function servo(p: AnalogPin, v: number) {
        pins.servoWritePin(p, v)
    }

    // set LCD reg
    function setreg(d: number) {
        pins.i2cWriteNumber(i2cAddr, d, NumberFormat.Int8LE)
        basic.pause(1)
    }

    // send data to I2C bus
    function set(d: number) {
        d = d & 0xF0
        d = d + BK + RS
        setreg(d)
        setreg(d + 4)
        setreg(d)
    }

    // send command
    function cmd(d: number) {
        RS = 0
        set(d)
        set(d << 4)
    }

    // send data
    function dat(d: number) {
        RS = 1
        set(d)
        set(d << 4)
    }

    // 自动识别I2C地址
    function AutoAddr() {
        let k = true
        let addr = 0x20
        let d1 = 0, d2 = 0
        while (k && (addr < 0x28)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr

        addr = 0x38
        while (k && (addr < 0x40)) {
            pins.i2cWriteNumber(addr, -1, NumberFormat.Int32LE)
            d1 = pins.i2cReadNumber(addr, NumberFormat.Int8LE) % 16
            pins.i2cWriteNumber(addr, 0, NumberFormat.Int16LE)
            d2 = pins.i2cReadNumber(addr, NumberFormat.Int8LE)
            if ((d1 == 7) && (d2 == 0)) k = false
            else addr += 1
        }
        if (!k) return addr
        else return 0
    }

    /**
     * 初始化 LCD, 设置 I2C 地址。根据芯片不同地址有两种，PCF8574 是 39，PCF8574A 是 63, 地址设置为0 代表自动识别
     * @param address is i2c address for LCD, eg: 0, 39, 63
     */
    //% blockId="KUBIT_I2C_LCD1620_SET_ADDRESS" block="初始化液晶，I2C 地址 %addr"
    //% weight=100 blockGap=8
    export function LcdInit(Addr: number) {
        if (Addr == 0) i2cAddr = AutoAddr()
        else i2cAddr = Addr
        BK = 8
        RS = 0
        cmd(0x33)       // set 4bit mode
        basic.pause(5)
        set(0x30)
        basic.pause(5)
        set(0x20)
        basic.pause(5)
        cmd(0x28)       // set mode
        cmd(0x0C)
        cmd(0x06)
        cmd(0x01)       // clear
    }

    /**
     * 在液晶的指定位置显示数字
     * @param n is number will be show, eg: 10, 100, 200
     * @param x is LCD column position, eg: 0
     * @param y is LCD row position, eg: 0
     */
    //% blockId="KUBIT_I2C_LCD1620_SHOW_NUMBER" block="显示数字 %n|位置 x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    export function ShowNumber(n: number, x: number, y: number): void {
        let s = n.toString()
        ShowString(s, x, y)
    }

    /**
     * 在液晶的指定位置显示字符串
     * @param s is string will be show, eg: "Hello"
     * @param x is LCD column position, [0 - 15], eg: 0
     * @param y is LCD row position, [0 - 1], eg: 0
     */
    //% blockId="KUBIT_I2C_LCD1620_SHOW_STRING" block="显示字符串 %s|位置 x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    export function ShowString(s: string, x: number, y: number): void {
        let a: number

        if (y > 0)
            a = 0xC0
        else
            a = 0x80
        a += x
        cmd(a)

        for (let i = 0; i < s.length; i++) {
            dat(s.charCodeAt(i))
        }
    }

    /**
     * 液晶显示控制
     * @param on , eg: true
     */
    //% blockId="KUBIT_I2C_LCD1620_SHOW" block="液晶显示 %on" advanced=true
    //% weight=81 blockGap=8
    export function show(on: boolean): void {
        if (on) cmd(0x0C)
        else cmd(0x08)
    }

    /**
     * 清除液晶上显示的内容
     */
    //% blockId="KUBIT_I2C_LCD1620_CLEAR" block="清除液晶显示内容" advanced=true
    //% weight=85 blockGap=8
    export function clear(): void {
        cmd(0x01)
    }

    /**
     * 液晶的背光控制
     * @param on , eg: true
     */
    //% blockId="KUBIT_I2C_LCD1620_BACKLIGHT" block="液晶背光 %on" advanced=true
    //% weight=70 blockGap=8
    export function Backlight(on: boolean): void {
        if (on) BK = 8
        else BK = 0
        cmd(0)
    }

    /**
     * 屏幕向左移动
     */
    //% blockId="KUBIT_I2C_LCD1620_SHL" block="屏幕左移" advanced=true
    //% weight=61 blockGap=8
    export function shl(): void {
        cmd(0x18)
    }

    /**
     * 屏幕向右移动
     */
    //% blockId="KUBIT_I2C_LCD1620_SHR" block="屏幕右移" advanced=true
    //% weight=60 blockGap=8
    export function shr(): void {
        cmd(0x1C)
    }

}
