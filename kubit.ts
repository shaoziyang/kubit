//% weight=50 color=#cc1280 icon="K" block="�����"
namespace kubit {
    let i2cAddr: number // 0x3F: PCF8574A, 0x27: PCF8574
    let BK: number      // backlight control
    let RS: number      // command/data

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

    // �Զ�ʶ��I2C��ַ
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
     * ��ʼ�� LCD, ���� I2C ��ַ������оƬ��ͬ��ַ�����֣�PCF8574 �� 39��PCF8574A �� 63, ��ַ����Ϊ0 �����Զ�ʶ��
     * @param address is i2c address for LCD, eg: 0, 39, 63
     */
    //% blockId="KUBIT_I2C_LCD1620_SET_ADDRESS" block="��ʼ��Һ����I2C ��ַ %addr"
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
     * ��Һ����ָ��λ����ʾ����
     * @param n is number will be show, eg: 10, 100, 200
     * @param x is LCD column position, eg: 0
     * @param y is LCD row position, eg: 0
     */
    //% blockId="KUBIT_I2C_LCD1620_SHOW_NUMBER" block="��ʾ���� %n|λ�� x %x|y %y"
    //% weight=90 blockGap=8
    //% x.min=0 x.max=15
    //% y.min=0 y.max=1
    export function ShowNumber(n: number, x: number, y: number): void {
        let s = n.toString()
        ShowString(s, x, y)
    }

    /**
     * ��Һ����ָ��λ����ʾ�ַ���
     * @param s is string will be show, eg: "Hello"
     * @param x is LCD column position, [0 - 15], eg: 0
     * @param y is LCD row position, [0 - 1], eg: 0
     */
    //% blockId="KUBIT_I2C_LCD1620_SHOW_STRING" block="��ʾ�ַ��� %s|λ�� x %x|y %y"
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
     * Һ����ʾ����
     * @param on , eg: true
     */
    //% blockId="KUBIT_I2C_LCD1620_SHOW" block="Һ����ʾ %on"
    //% weight=81 blockGap=8
    export function show(on: boolean): void {
        if (on) cmd(0x0C)
        else cmd(0x08)
    }

    /**
     * ���Һ������ʾ������
     */
    //% blockId="KUBIT_I2C_LCD1620_CLEAR" block="���Һ����ʾ����"
    //% weight=85 blockGap=8
    export function clear(): void {
        cmd(0x01)
    }

    /**
     * Һ���ı������
     * @param on , eg: true
     */
    //% blockId="KUBIT_I2C_LCD1620_BACKLIGHT" block="Һ������ %on"
    //% weight=70 blockGap=8
    export function Backlight(on: boolean): void {
        if (on) BK = 8
        else BK = 0
        cmd(0)
    }

    /**
     * ��Ļ�����ƶ�
     */
    //% blockId="KUBIT_I2C_LCD1620_SHL" block="��Ļ����"
    //% weight=61 blockGap=8
    export function shl(): void {
        cmd(0x18)
    }

    /**
     * ��Ļ�����ƶ�
     */
    //% blockId="KUBIT_I2C_LCD1620_SHR" block="��Ļ����"
    //% weight=60 blockGap=8
    export function shr(): void {
        cmd(0x1C)
    }

}
